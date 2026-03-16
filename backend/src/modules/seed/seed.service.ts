import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';

const DEMO_MARKER = '__lumis_demo__';

const DEMO_MEMBER = {
  full_name: 'System Node',
  nickname: 'Node',
  relation_type: 'friend',
  date_of_birth: '1994-06-07',
  place_of_birth: 'San Francisco, CA',
  notes: DEMO_MARKER,
};

const DEMO_TRAITS = [
  // Pros
  {
    category: 'pro',
    description:
      "Remembers every small detail about the people she loves — birthdays, favorite foods, passing comments from months ago. Being around her makes you feel truly seen.",
    intensity: 3,
    emotion_tag: 'warmth',
  },
  {
    category: 'pro',
    description:
      "Her laugh is genuinely contagious — she can shift the entire energy of a room within seconds.",
    intensity: 2,
    emotion_tag: 'joy',
  },
  {
    category: 'pro',
    description:
      "Fiercely loyal. She will show up at 2am with snacks and zero judgment if you need her.",
    intensity: 3,
    emotion_tag: 'trust',
  },
  {
    category: 'pro',
    description:
      "Creative problem-solver — always finds a third option when you feel stuck between two bad ones.",
    intensity: 2,
    emotion_tag: 'admiration',
  },
  // Cons
  {
    category: 'con',
    description:
      "Tends to jump straight into advice-giving when what you actually need is just to be heard and validated first.",
    intensity: 2,
    emotion_tag: 'frustration',
  },
  {
    category: 'con',
    description:
      "Gets defensive quickly when she feels criticized — even gently framed feedback can trigger a 2-3 day shutdown.",
    intensity: 3,
    emotion_tag: 'tension',
  },
  {
    category: 'con',
    description:
      "Chronically late — 20 to 40 minutes, almost every single time, for everything.",
    intensity: 1,
    emotion_tag: 'mild irritation',
  },
];

const DEMO_INCIDENTS = [
  {
    title: 'The Surprise Birthday Gathering',
    description:
      "She secretly coordinated 14 of my closest friends across three cities for a surprise dinner on my birthday — people I hadn't seen in years. One of the most thoughtful things anyone has ever done for me.",
    date: '2025-09-14',
    category: 'celebration',
    severity: 'low',
    outcome:
      'Left feeling deeply seen and loved. A reminder that she expresses care through grand gestures when she notices.',
    emotions: ['grateful', 'surprised', 'loved', 'overwhelmed'],
  },
  {
    title: 'The Feedback Spiral',
    description:
      "I gently suggested her new business pitch needed more market research before the investor meeting. I framed it carefully. She went quiet mid-sentence, said she had to go, and didn't respond to messages for three days.",
    date: '2025-11-08',
    category: 'conflict',
    severity: 'medium',
    outcome:
      'She eventually reached out as if nothing happened. We never actually talked through it. The pattern repeated.',
    emotions: ['confused', 'frustrated', 'hurt', 'helpless'],
  },
  {
    title: 'The 2am Hospital Run',
    description:
      "I came down with a high fever on a random Tuesday evening. Without being asked, she drove 45 minutes, brought homemade soup, and stayed the entire afternoon watching bad TV and making me laugh.",
    date: '2025-08-20',
    category: 'breakthrough',
    severity: 'low',
    outcome:
      'A clear example of who she is at her core — underneath the patterns, there is genuine, deep care.',
    emotions: ['grateful', 'touched', 'safe', 'cared for'],
  },
  {
    title: 'The Forgotten Presentation',
    description:
      "She had confirmed her attendance at my biggest work presentation of the year — the one I'd been preparing for months. She didn't show. Found out later she had simply forgotten and gone to brunch instead.",
    date: '2025-12-05',
    category: 'challenge',
    severity: 'high',
    outcome:
      "I didn't bring it up immediately because I didn't want to trigger another disappearing act. Still processing.",
    emotions: ['disappointed', 'sad', 'overlooked', 'conflicted'],
  },
];

const DEMO_PATTERNS = [
  {
    title: 'Disappears Under Stress',
    description:
      "When she's overwhelmed — work deadlines, family tension, her own inner conflict — she goes completely silent. No replies, no explanation, nothing for days. Then resurfaces as if the silence never happened.",
    category: 'communication',
    frequency: 'frequent',
    impact: 'negative',
    triggers: [
      "Career pressure or a high-stakes deadline",
      "Family conflict or an unresolved dynamic at home",
      "A moment where she doesn't know how to ask for help",
    ],
    examples: [
      "Went MIA for 5 days during her job transition without a single message",
      "3-day silence after the feedback disagreement about her pitch",
    ],
  },
  {
    title: 'Love Bombing After Conflict',
    description:
      "After an argument, a cold spell, or a period of distance, she overcompensates — becomes extra attentive, sends gifts, reaches out frequently. It can feel jarring but also genuinely sweet and remorseful.",
    category: 'affection',
    frequency: 'occasional',
    impact: 'neutral',
    triggers: [
      "After she's been unavailable or distant",
      "After she's said something she knows was hurtful",
      "Guilt following an ignored message thread",
    ],
    examples: [
      "Sent a bouquet after the feedback spiral without acknowledging what happened",
      "Showed up with my favorite dessert after a particularly tense week",
    ],
  },
  {
    title: 'Shows Up Strongest in Crises',
    description:
      "Paradoxically, she is at her very best when things are genuinely serious. In real emergencies, she becomes present, calm, and completely focused. It's as if the emotional noise disappears and only care remains.",
    category: 'stress-response',
    frequency: 'occasional',
    impact: 'positive',
    triggers: [
      "When someone she loves is in genuine distress",
      "Medical or physical emergencies",
      "When a mutual friend is going through something serious",
    ],
    examples: [
      "The hospital visit — arrived in 45 minutes with food and stayed all afternoon",
      "Helped a mutual friend through a difficult breakup for three consecutive nights, no sleep",
    ],
  },
];

const DEMO_INTERACTIONS = [
  {
    title: 'Coffee at Blue Bottle',
    description:
      "A 90-minute catch-up that turned into something much deeper. We talked about where we both feel stuck, what we actually want from the next year, and why some friendships feel effortless while others are exhausting.",
    date: '2025-10-12',
    type: 'in-person',
    duration: '90 minutes',
    quality: 'excellent',
    mood_before: 'a bit low, needed connection',
    mood_after: 'recharged and lighter than I expected',
    energy_level: 8,
    topics: ['career transitions', 'what we want from relationships', 'feeling stuck', 'processing 2025'],
  },
  {
    title: 'Quick Phone Check-In',
    description:
      "Called to catch up but she was clearly preoccupied. Short answers, long pauses. Felt like I was talking at her rather than with her. Ended after 12 minutes when she said she had to jump on something.",
    date: '2025-11-20',
    type: 'call',
    duration: '12 minutes',
    quality: 'neutral',
    mood_before: 'fine, just wanted to connect',
    mood_after: 'slightly flat, like I interrupted something',
    energy_level: 5,
    topics: ['brief check-in', 'nothing substantial'],
  },
  {
    title: 'Weekend Hike at Muir Woods',
    description:
      "Four hours in the redwoods. We barely talked for the first hour — just walked. Then it opened up into one of the most honest conversations we've had in years. She shared things she'd never told me.",
    date: '2025-12-28',
    type: 'in-person',
    duration: '4 hours',
    quality: 'excellent',
    mood_before: 'anxious, needed to get out of my head',
    mood_after: 'grounded, calm, grateful for her',
    energy_level: 9,
    topics: ['big life questions', 'her relationship and what she wants', 'what 2026 feels like', 'things we avoid saying'],
  },
  {
    title: 'Voice Note Exchange',
    description:
      "I sent her a long voice note processing something I was going through. She replied two hours later with an equally long, thoughtful message that covered things I hadn't even fully articulated to myself. One of those exchanges that reminds you why certain friendships are irreplaceable.",
    date: '2026-01-08',
    type: 'text',
    duration: '25 minutes total',
    quality: 'good',
    mood_before: 'processing something heavy, needed to think out loud',
    mood_after: 'warm, understood, less alone with it',
    energy_level: 7,
    topics: ['processing a hard decision', 'patterns in relationships', 'self-worth'],
  },
];

const DEMO_JOURNAL = [
  {
    title: 'The push and pull with Luma',
    content:
      "I've been sitting with the feedback incident for a few days now. I said something carefully, something true, and she disappeared. And the strange thing is — I wasn't even surprised. I knew it might happen. I adjusted my words. I lowered my voice. And she still left.\n\nI think what bothers me isn't the silence. It's that I've started calibrating my honesty around her sensitivity. And I don't know when that started.\n\nShe's one of the people I love most. She would drive across the city for me at midnight. I know that. But I also know that I can't fully exhale around her, because there's always a part of me monitoring — is this too much? Will this land wrong?\n\nMaybe that's worth naming. Just to myself, for now.",
    date: '2025-11-15',
    emotions: ['confused', 'frustrated', 'still caring', 'reflective'],
  },
  {
    title: 'After the hike',
    content:
      "We talked for four hours today. Like really talked — the kind where you forget your phone exists.\n\nShe told me things she's never said out loud before. About her family, about what she's afraid of, about the gap between the version of herself she shows people and the one she actually lives with.\n\nI thought about the last few months — the silences, the frustrations — and somehow they all felt smaller after today. Not gone. Just smaller.\n\nI think the hike reminded me that the complexity I feel about her isn't a reason to let go. It's actually proof of something real. You don't feel this complicated about people who don't matter.\n\nGrateful for today.",
    date: '2025-12-29',
    emotions: ['grateful', 'grounded', 'hopeful', 'tender'],
  },
  {
    title: 'Why does her showing up still surprise me?',
    content:
      "Every time she shows up in a crisis — the hospital, the 2am calls, the moments that count — I feel genuinely surprised. And I've been wondering why.\n\nI think I've been building a mental model of her based on the patterns I find difficult. The lateness. The defensive retreats. The silence. And I keep that model up front, so when the real her appears — the one who drives 45 minutes with soup and doesn't ask for anything in return — I don't know what to do with her.\n\nMaybe the goal isn't to resolve the contradiction. Maybe some people are exactly this: genuinely wonderful in the ways that matter most, and genuinely difficult in the ways that are hardest to hold.\n\nI want to stop being surprised by her goodness. I want to hold both things at once — the patterns and the person — without needing them to resolve into something simpler.",
    date: '2026-01-20',
    emotions: ['warm', 'reflective', 'tender', 'growing'],
  },
];

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /** Creates the demo luminary for the given user. Idempotent — safe to call multiple times. */
  async seedDemoLuminary(userId: string): Promise<{ created: boolean; memberId?: string }> {
    const supabase = this.supabaseService.getAdminClient();

    // Check if demo already exists for this user
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', userId)
      .ilike('notes', `%${DEMO_MARKER}%`)
      .maybeSingle();

    if (existing) {
      return { created: false, memberId: existing.id };
    }

    try {
      // 1. Create member
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert({ user_id: userId, ...DEMO_MEMBER })
        .select()
        .single();

      if (memberError || !member) throw new Error(memberError?.message ?? 'Member creation failed');
      const memberId: string = member.id;

      // 2. Traits
      await supabase.from('traits').insert(
        DEMO_TRAITS.map(t => ({
          user_id: userId,
          member_id: memberId,
          ...t,
          tags: [],
        })),
      );

      // 3. Incidents
      await supabase.from('incidents').insert(
        DEMO_INCIDENTS.map(i => ({
          user_id: userId,
          member_id: memberId,
          ...i,
          tags: [],
        })),
      );

      // 4. Patterns
      await supabase.from('patterns').insert(
        DEMO_PATTERNS.map(p => ({
          user_id: userId,
          member_id: memberId,
          pattern_type: p.category,
          ...p,
          tags: [],
        })),
      );

      // 5. Interactions
      await supabase.from('interactions').insert(
        DEMO_INTERACTIONS.map(i => ({
          user_id: userId,
          member_id: memberId,
          ...i,
          tags: [],
        })),
      );

      // 6. Journal entries
      await supabase.from('journal_entries').insert(
        DEMO_JOURNAL.map(j => ({
          user_id: userId,
          member_id: memberId,
          ...j,
          tags: [],
        })),
      );

      this.logger.log(`Demo luminary created for user ${userId} (member: ${memberId})`);
      return { created: true, memberId };
    } catch (err: any) {
      this.logger.error(`Failed to seed demo luminary for user ${userId}: ${err.message}`);
      throw err;
    }
  }
}
