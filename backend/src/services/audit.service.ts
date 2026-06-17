import { Request } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest } from '../types';

interface AuditLogOptions {
  aksi: string;
  resourceType?: string;
  resourceId?: string; // Target: program name or description
  oldValues?: any;
  newValues?: any;
  level?: 'INFO' | 'WARNING' | 'ERROR';
}

export const logAudit = async (req: Request | AuthenticatedRequest, options: AuditLogOptions) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    
    // Get IP Address
    let ip = req.ip || req.socket.remoteAddress || (req.headers['x-forwarded-for'] as string) || '';
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    } else if (ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }
    
    // Get User Agent
    const userAgent = (req.headers['user-agent'] as string) || '';

    const { error } = await supabaseAdmin.from('audit_logs').insert({
      user_id: user?.userId || null,
      user_email: user?.email || null,
      user_role: user?.role || null,
      aksi: options.aksi,
      resource_type: options.resourceType || null,
      resource_id: options.resourceId || null,
      old_values: options.oldValues || null,
      new_values: options.newValues || null,
      ip_address: ip,
      user_agent: userAgent,
      session_id: user?.jti || null,
      level: options.level || 'INFO',
    });

    if (error) {
      console.warn('Failed to insert audit log with full columns, trying fallback:', error.message);
      const targetStr = options.resourceId ? ` [Target: ${options.resourceId}]` : '';
      const fallbackAksi = `${options.aksi}${targetStr}`;
      
      const { error: fallbackError } = await supabaseAdmin.from('audit_logs').insert({
        user_id: user?.userId || null,
        aksi: fallbackAksi,
        ip_address: ip,
        level: options.level || 'INFO',
      });
      if (fallbackError) {
        console.error('Failed to log audit fallback:', fallbackError.message);
      }
    }
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};

export const logAuditManual = async (payload: {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  aksi: string;
  resourceType?: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  level?: 'INFO' | 'WARNING' | 'ERROR';
}) => {
  try {
    let ip = payload.ipAddress || null;
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    } else if (ip && ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }

    const { error } = await supabaseAdmin.from('audit_logs').insert({
      user_id: payload.userId || null,
      user_email: payload.userEmail || null,
      user_role: payload.userRole || null,
      aksi: payload.aksi,
      resource_type: payload.resourceType || null,
      resource_id: payload.resourceId || null,
      old_values: payload.oldValues || null,
      new_values: payload.newValues || null,
      ip_address: ip,
      user_agent: payload.userAgent || null,
      session_id: payload.sessionId || null,
      level: payload.level || 'INFO',
    });

    if (error) {
      console.warn('Failed to insert audit log manual with full columns, trying fallback:', error.message);
      const targetStr = payload.resourceId ? ` [Target: ${payload.resourceId}]` : '';
      const fallbackAksi = `${payload.aksi}${targetStr}`;

      const { error: fallbackError } = await supabaseAdmin.from('audit_logs').insert({
        user_id: payload.userId || null,
        aksi: fallbackAksi,
        ip_address: ip,
        level: payload.level || 'INFO',
      });
      if (fallbackError) {
        console.error('Failed to log audit manual fallback:', fallbackError.message);
      }
    }
  } catch (error) {
    console.error('Failed to log audit manual:', error);
  }
};

export const getProgramNameByApplicationId = async (applicationId: string): Promise<string> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('scholarship_programs(nama)')
      .eq('id', applicationId)
      .single();
    if (error || !data) return '-';
    return (data.scholarship_programs as any)?.nama || '-';
  } catch {
    return '-';
  }
};

export const getProgramNameByDisbursementId = async (disbursementId: string): Promise<string> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('fund_disbursements')
      .select('applications(scholarship_programs(nama))')
      .eq('id', disbursementId)
      .single();
    if (error || !data) return '-';
    return (data.applications as any)?.scholarship_programs?.nama || '-';
  } catch {
    return '-';
  }
};

export const getProgramNameByReportId = async (reportId: string): Promise<string> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('fund_reports')
      .select('applications(scholarship_programs(nama))')
      .eq('id', reportId)
      .single();
    if (error || !data) return '-';
    return (data.applications as any)?.scholarship_programs?.nama || '-';
  } catch {
    return '-';
  }
};

export const getProgramNameByProgramId = async (programId: string): Promise<string> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('scholarship_programs')
      .select('nama')
      .eq('id', programId)
      .single();
    if (error || !data) return '-';
    return data.nama || '-';
  } catch {
    return '-';
  }
};
