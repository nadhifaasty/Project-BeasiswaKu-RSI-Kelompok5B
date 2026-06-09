import { supabaseAdmin } from '../config/supabase';

export const getUsers = async (params: any) => {
  const {
    page = 1,
    per_page = 15,
    search,
    role,
    sort_by = 'created_at',
    order = 'desc',
  } = params;

  let query = supabaseAdmin.from('profiles').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`nama_lengkap.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (role) {
    query = query.eq('role', role.toLowerCase());
  }

  const sortField = sort_by === 'full_name' ? 'nama_lengkap' : 'created_at';
  const from = (Number(page) - 1) * Number(per_page);
  const to = from + Number(per_page) - 1;

  query = query.order(sortField, { ascending: order === 'asc' }).range(from, to);

  const { data: profiles, error, count } = await query;
  if (error) throw new Error(error.message);

  const users = profiles.map((p) => ({
    id: p.id,
    full_name: p.nama_lengkap,
    email: p.email,
    role: p.role.toUpperCase(),
    is_active: true,
    created_at: p.created_at,
    last_login_at: p.updated_at,
  }));

  return {
    data: users,
    meta: {
      current_page: Number(page),
      per_page: Number(per_page),
      total: count || 0,
      last_page: Math.ceil((count || 0) / Number(per_page)),
    },
  };
};

export const getUserById = async (id: string) => {
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileErr || !profile) {
    throw new Error('User dengan ID tersebut tidak ditemukan.');
  }

  return {
    id: profile.id,
    full_name: profile.nama_lengkap,
    email: profile.email,
    nim_nisn: profile.nim_nisn,
    phone: profile.nomor_hp,
    role: profile.role.toUpperCase(),
    is_active: true,
    created_at: profile.created_at,
    last_login_at: profile.updated_at,
    completion_pct: profile.biodata_progress || 0,
  };
};

export const updateUserProfile = async (id: string, payload: any) => {
  const { full_name, phone, data_pribadi, alamat, ortu_wali, akademik } = payload;

  const updateData: any = {};
  if (full_name) updateData.nama_lengkap = full_name;
  if (phone) updateData.nomor_hp = phone;

  if (Object.keys(updateData).length > 0) {
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id);
    if (profileErr) throw new Error(profileErr.message);
  }

  if (data_pribadi) {
    const { error } = await supabaseAdmin
      .from('biodata_pribadi')
      .upsert({ user_id: id, ...data_pribadi });
    if (error) throw new Error(error.message);
  }
  if (alamat) {
    const { error } = await supabaseAdmin
      .from('biodata_alamat')
      .upsert({ user_id: id, ...alamat });
    if (error) throw new Error(error.message);
  }
  if (ortu_wali) {
    const { error } = await supabaseAdmin
      .from('biodata_orang_tua')
      .upsert({ user_id: id, ...ortu_wali });
    if (error) throw new Error(error.message);
  }
  if (akademik) {
    const { error } = await supabaseAdmin
      .from('biodata_akademik')
      .upsert({ user_id: id, ...akademik });
    if (error) throw new Error(error.message);
  }

  return {
    id,
    full_name: full_name || '',
    completion_pct: 100,
  };
};

export const updateUserRole = async (id: string, targetRole: string, actorId: string) => {
  if (id === actorId) {
    throw new Error('SuperAdmin tidak dapat mengubah role dirinya sendiri.');
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single();

  if (!profile) {
    throw new Error('User tidak ditemukan.');
  }

  const normalizedRole = targetRole.toLowerCase();
  if (!['siswa', 'admin', 'super_admin'].includes(normalizedRole)) {
    throw new Error('Role tidak valid.');
  }

  if (profile.role === 'super_admin' && normalizedRole !== 'super_admin') {
    const { count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'super_admin');

    if (count && count <= 1) {
      throw new Error('Tidak dapat mengubah role SuperAdmin terakhir.');
    }
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: normalizedRole })
    .eq('id', id);

  if (error) throw new Error(error.message);

  await supabaseAdmin.auth.admin.updateUserById(id, {
    user_metadata: { role: normalizedRole },
  });

  return {
    id,
    old_role: profile.role.toUpperCase(),
    new_role: targetRole.toUpperCase(),
  };
};

export const updateUserStatus = async (id: string, is_active: boolean, actorId: string) => {
  if (id === actorId) {
    throw new Error('SuperAdmin tidak dapat menonaktifkan akunnya sendiri.');
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: is_active ? 'none' : '876000h',
  });

  if (error) throw new Error(error.message);

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('nama_lengkap')
    .eq('id', id)
    .single();

  return {
    id,
    full_name: profile?.nama_lengkap || '',
    is_active,
  };
};
