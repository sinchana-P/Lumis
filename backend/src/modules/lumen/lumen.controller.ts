import { Body, Controller, Delete, ForbiddenException, Get, Logger, NotFoundException, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { SupabaseService } from '../../common/services/supabase.service';
import { LumenService } from './lumen.service';
import { LumenChatDto, RelationshipReportDto } from './dto';
import { LumenMember, LumenUserProfile } from './lumen-types';

@ApiTags('lumen')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('lumen')
export class LumenController {
  private readonly logger = new Logger(LumenController.name);

  constructor(
    private readonly lumenService: LumenService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // ── CONVERSATION CRUD ─────────────────────────────────────────

  @Get('conversations')
  @ApiOperation({ summary: 'List all conversations for the current user' })
  async listConversations(@User() user: any) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('lumen_conversations')
      .select('id, mode, messages, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return { success: true, data: data ?? [] };
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a single conversation with all messages' })
  async getConversation(@User() user: any, @Param('id') id: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase
      .from('lumen_conversations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) throw new NotFoundException('Conversation not found');
    return { success: true, data };
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete a conversation' })
  async deleteConversation(@User() user: any, @Param('id') id: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data } = await supabase
      .from('lumen_conversations')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!data) throw new ForbiddenException('Conversation not found');

    await supabase.from('lumen_conversations').delete().eq('id', id);
    return { success: true };
  }

  // ── CHAT ENDPOINTS ────────────────────────────────────────────

  @Post('ask')
  @ApiOperation({ summary: 'Chat with Lumen (non-streaming)' })
  async ask(@User() user: any, @Body() dto: LumenChatDto) {
    const supabase = this.supabaseService.getAdminClient();
    const { userProfile, members } = await this.loadContext(user.id, dto.memberIds || []);
    const result = await this.lumenService.chat(
      {
        userId: user.id,
        prompt: dto.prompt,
        mode: dto.mode,
        depth: dto.depth,
        memberIds: dto.memberIds || [],
        history: dto.history || [],
        conversationId: dto.conversationId,
      },
      members,
      userProfile,
    );

    // ── Persist to lumen_conversations ──────────────────────────
    const userMessage  = { role: 'user',      content: dto.prompt,   timestamp: new Date().toISOString(), depth: dto.depth };
    const aiMessage    = { role: 'assistant', content: result.text,  timestamp: new Date().toISOString(), mode: result.mode, model: result.model };

    let conversationId = dto.conversationId;
    if (conversationId) {
      // Append to existing conversation
      const { data: existing } = await supabase
        .from('lumen_conversations')
        .select('messages')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();
      if (existing) {
        const msgs = [...(existing.messages ?? []), userMessage, aiMessage];
        await supabase.from('lumen_conversations').update({ messages: msgs, updated_at: new Date().toISOString() }).eq('id', conversationId);
      }
    } else {
      // Create new conversation
      const { data: newConv } = await supabase
        .from('lumen_conversations')
        .insert({ user_id: user.id, mode: dto.mode, messages: [userMessage, aiMessage] })
        .select('id')
        .single();
      conversationId = newConv?.id;
    }

    return { success: true, data: { ...result, conversationId } };
  }

  @Post('ask/stream')
  @ApiOperation({ summary: 'Chat with Lumen (SSE streaming)' })
  async askStream(@User() user: any, @Body() dto: LumenChatDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const supabase = this.supabaseService.getAdminClient();
    const { userProfile, members } = await this.loadContext(user.id, dto.memberIds || []);

    let fullText = '';
    try {
      const stream = this.lumenService.chatStream(
        {
          userId: user.id,
          prompt: dto.prompt,
          mode: dto.mode,
          depth: dto.depth,
          memberIds: dto.memberIds || [],
          history: dto.history || [],
          conversationId: dto.conversationId,
        },
        members,
        userProfile,
      );

      for await (const chunk of stream) {
        fullText += chunk;
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    } finally {
      // ── Persist conversation after streaming completes ─────────
      try {
        const userMessage = { role: 'user',      content: dto.prompt, timestamp: new Date().toISOString(), depth: dto.depth };
        const aiMessage   = { role: 'assistant', content: fullText,   timestamp: new Date().toISOString(), mode: dto.mode };
        let conversationId = dto.conversationId;

        if (conversationId) {
          const { data: existing } = await supabase
            .from('lumen_conversations')
            .select('messages')
            .eq('id', conversationId)
            .eq('user_id', user.id)
            .single();
          if (existing) {
            const msgs = [...(existing.messages ?? []), userMessage, aiMessage];
            await supabase.from('lumen_conversations').update({ messages: msgs, updated_at: new Date().toISOString() }).eq('id', conversationId);
          }
        } else {
          const { data: newConv } = await supabase
            .from('lumen_conversations')
            .insert({ user_id: user.id, mode: dto.mode, messages: [userMessage, aiMessage] })
            .select('id')
            .single();
          conversationId = newConv?.id;
        }

        // Send conversationId as final SSE event before DONE
        if (conversationId) {
          res.write(`data: ${JSON.stringify({ conversationId })}\n\n`);
        }
      } catch { /* non-fatal — conversation not persisted */ }

      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  @Get('self-report')
  @ApiOperation({ summary: 'Generate a personal self-intelligence report' })
  async selfReport(@User() user: any) {
    const { userProfile } = await this.loadContext(user.id, []);
    const text = await this.lumenService.generateSelfReport(userProfile);
    return { success: true, data: { text } };
  }

  @Post('relationship-report/:memberId')
  @ApiOperation({ summary: 'Generate a relationship intelligence report for a member' })
  async relationshipReport(
    @User() user: any,
    @Param('memberId') memberId: string,
    @Body() dto: RelationshipReportDto,
  ) {
    try {
      const { userProfile, members } = await this.loadContext(user.id, [memberId]);
      const member = members[0];
      if (!member) return { success: false, error: { message: 'Member not found' } };

      const text = await this.lumenService.generateRelationshipReport(
        userProfile, member, dto.depth || 'FULL_SPECTRUM',
      );
      return { success: true, data: { text } };
    } catch (err: any) {
      this.logger.error('relationship-report error', err?.stack || err?.message || err);
      return { success: false, error: { code: 'AI_SERVICE_ERROR', message: err?.message || 'Failed to generate report' } };
    }
  }

  @Get('weekly-digest')
  @ApiOperation({ summary: 'Generate the weekly relationship digest' })
  async weeklyDigest(@User() user: any) {
    const { userProfile, members } = await this.loadContext(user.id, []);
    const text = await this.lumenService.generateWeeklyDigest(userProfile, members);
    return { success: true, data: { text } };
  }

  // ── LOAD CONTEXT FROM DB ────────────────────────────────────
  private async loadContext(userId: string, memberIds: string[]): Promise<{ userProfile: LumenUserProfile; members: LumenMember[] }> {
    const supabase = this.supabaseService.getAdminClient();

    // Load user profile
    const { data: userData } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    const { data: userNumerology } = await supabase.from('numerology_profiles').select('*').eq('user_id', userId).is('member_id', null).maybeSingle();
    const { data: userAstrology } = await supabase.from('astrology_profiles').select('*').eq('user_id', userId).is('member_id', null).maybeSingle();
    const { data: userTraits } = await supabase.from('traits').select('*').eq('user_id', userId).is('member_id', null).is('deleted_at', null);

    const userProfile: LumenUserProfile = {
      id: userId,
      name: userData?.full_name?.split(' ')[0] || userData?.email || 'You',
      fullName: userData?.full_name,
      dob: userData?.date_of_birth,
      numerologyData: userNumerology ? { coreNumbers: userNumerology.core_numbers, timingNumbers: userNumerology.timing_numbers } : undefined,
      astrologyData: userAstrology ? { computed: userAstrology.computed } : undefined,
      traits: (userTraits || []).map((t: any) => ({ id: t.id, category: t.category, description: t.description })),
    };

    // Load members
    let memberQuery = supabase.from('members').select('*').eq('user_id', userId).eq('archived', false);
    if (memberIds.length) memberQuery = memberQuery.in('id', memberIds);
    const { data: membersData } = await memberQuery;

    const members: LumenMember[] = await Promise.all(
      (membersData || []).map(async (m: any) => {
        const [numData, astroData, traitsData, incidentsData, interactionsData, journalData] = await Promise.all([
          supabase.from('numerology_profiles').select('*').eq('member_id', m.id).maybeSingle(),
          supabase.from('astrology_profiles').select('*').eq('member_id', m.id).maybeSingle(),
          supabase.from('traits').select('*').eq('member_id', m.id).is('deleted_at', null),
          supabase.from('incidents').select('*').eq('member_id', m.id).is('deleted_at', null).order('date', { ascending: false }).limit(10),
          supabase.from('interactions').select('*').eq('member_id', m.id).is('deleted_at', null).order('date', { ascending: false }).limit(5),
          supabase.from('journal_entries').select('*').eq('member_id', m.id).is('deleted_at', null).order('date', { ascending: false }).limit(3),
        ]);

        return {
          id: m.id,
          userId,
          name: m.nickname || m.full_name?.split(' ')[0] || m.full_name,
          fullName: m.full_name,
          relation: m.relation_type,
          dob: m.date_of_birth,
          birthTime: m.time_of_birth,
          birthPlace: m.place_of_birth,
          numerologyData: numData.data ? { coreNumbers: numData.data.core_numbers, timingNumbers: numData.data.timing_numbers, insights: numData.data.insights, compatibility: numData.data.compatibility } : undefined,
          astrologyData: astroData.data ? { computed: astroData.data.computed, insights: astroData.data.insights } : undefined,
          traits: (traitsData.data || []).map((t: any) => ({ id: t.id, category: t.category, description: t.description, intensity: t.intensity })),
          incidents: (incidentsData.data || []).map((i: any) => ({ id: i.id, date: i.date, type: i.category, title: i.title, description: i.description, emotions: i.emotions || [], intensity: i.severity, resolution: i.outcome })),
          interactions: (interactionsData.data || []).map((i: any) => ({ id: i.id, date: i.date, feeling: i.quality, note: i.description, duration: i.energy_level })),
          journalEntries: (journalData.data || []).map((j: any) => ({ id: j.id, date: j.date, text: j.content })),
        } as LumenMember;
      }),
    );

    return { userProfile, members };
  }
}
