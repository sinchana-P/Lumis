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
      throw new Error(`Token verification failed: ${error.message}`);
    }

    return data.user;
  }

  /**
   * Get user by ID (admin operation)
   */
  async getUserById(userId: string) {
    const { data, error } = await this.supabaseAdmin.auth.admin.getUserById(userId);
    
    if (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data.user;
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
