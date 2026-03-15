import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url')!;
    const supabaseAnonKey = this.configService.get<string>('supabase.anonKey')!;
    const supabaseServiceKey = this.configService.get<string>('supabase.serviceRoleKey')!;

    // Client for user-level operations (respects RLS)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Admin client for service-level operations (bypasses RLS)
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Get Supabase client for user-level operations
   * This client respects Row-Level Security policies
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Get Supabase admin client for service-level operations
   * This client bypasses Row-Level Security policies
   * Use with caution!
   */
  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  /**
   * Create a client with a specific user's JWT token
   * This allows operations to be performed as that user
   */
  getClientForUser(accessToken: string): SupabaseClient {
    const supabaseUrl = this.configService.get<string>('supabase.url')!;
    const supabaseAnonKey = this.configService.get<string>('supabase.anonKey')!;

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Verify a JWT token and get user information
   */
  async verifyToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    
    if (error) {
      return { user: null, error };
    }

    return { user: data.user, error: null };
  }

  /**
   * Get user by ID (admin operation)
   */
  async getUserById(userId: string) {
    try {
      // First get auth user
      const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.getUserById(userId);
      
      if (authError) {
        return { user: null, error: authError };
      }

      // Then get user data from our users table
      const { data: userData, error: dbError } = await this.supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (dbError && dbError.code !== 'PGRST116') {
        return { user: null, error: dbError };
      }

      // Combine auth and database data
      const user = {
        id: authData.user.id,
        email: authData.user.email,
        full_name: userData?.full_name || null,
        date_of_birth: userData?.date_of_birth || null,
        time_of_birth: userData?.time_of_birth || null,
        place_of_birth: userData?.place_of_birth || null,
        place_of_birth_lat: userData?.place_of_birth_lat || null,
        place_of_birth_lng: userData?.place_of_birth_lng || null,
        avatar_url: userData?.avatar_url || null,
        provider: userData?.provider || 'local',
        analysis_depth_mode: userData?.analysis_depth_mode || 'full-spectrum',
        created_at: userData?.created_at || authData.user.created_at,
        updated_at: userData?.updated_at || authData.user.updated_at,
      };

      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(bucket: string, path: string, file: Buffer, contentType: string) {
    const { data, error } = await this.supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Delete file from Supabase Storage
   */
  async deleteFile(bucket: string, path: string) {
    const { error } = await this.supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }
}
