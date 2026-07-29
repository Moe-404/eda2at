import React, { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';
import { Plus, Edit, Trash2, Users, LayoutList } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';
import './ManageBooks.css';
import './ManageTeam.css';

// ─── Members ───────────────────────────────────────────────────────────────

const emptyMember = {
    name: '',
    role: '',
    department_id: '',
    short_bio: '',
    full_bio: '',
    display_order: 0,
};

const MembersTab = ({ departments }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyMember);
    const [photoFile, setPhotoFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const photoRef = useRef(null);

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/team/members');
            setMembers(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.department_id) { alert('يرجى اختيار القسم'); return; }

        const payload = new FormData();
        Object.entries(form).forEach(([k, v]) => payload.append(k, v ?? ''));
        if (photoFile) payload.append('photo', photoFile);

        setSubmitting(true);
        try {
            const headers = { 'Content-Type': 'multipart/form-data' };
            if (editing) {
                await api.put(`/team/members/${editing.id}`, payload, { headers });
            } else {
                await api.post('/team/members', payload, { headers });
            }
            await fetchMembers();
            resetForm();
        } catch (err) {
            const msg = err.response?.data?.errors?.map((e) => e.msg).join('\n')
                || err.response?.data?.error || 'فشل حفظ العضو';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) return;
        try {
            await api.delete(`/team/members/${id}`);
            fetchMembers();
        } catch (err) {
            const serverMsg = err.response?.data?.error;
            alert(`فشل حذف العضو: ${serverMsg || err.message || 'خطأ غير معروف'}`);
        }
    };

    const startEdit = (m) => {
        setEditing(m);
        setForm({
            name: m.name,
            role: m.role,
            department_id: m.department_id ?? '',
            short_bio: m.short_bio || '',
            full_bio: m.full_bio || '',
            display_order: m.display_order ?? 0,
        });
        setPhotoFile(null);
        if (photoRef.current) photoRef.current.value = '';
        setShowForm(true);
    };

    const resetForm = () => {
        setForm(emptyMember);
        setPhotoFile(null);
        if (photoRef.current) photoRef.current.value = '';
        setEditing(null);
        setShowForm(false);
    };

    if (loading) return <p>جاري التحميل...</p>;

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>إدارة الأعضاء</h1>
                    <p>{members.length} عضو مسجّل</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <Plus size={20} /> إضافة عضو
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>{editing ? 'تعديل العضو' : 'إضافة عضو جديد'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>الاسم *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    placeholder="أ/ خالد مصطفى"
                                />
                            </div>
                            <div className="form-group">
                                <label>المنصب / الدور *</label>
                                <input
                                    type="text"
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    required
                                    placeholder="مؤسس المشروع"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>القسم *</label>
                                <select
                                    value={form.department_id}
                                    onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                                    required
                                >
                                    <option value="">— اختر القسم —</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>ترتيب العرض</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.display_order}
                                    onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                الصورة الشخصية{' '}
                                {editing ? '(اتركها فارغة للإبقاء على الصورة الحالية)' : '(اختياري)'}
                            </label>
                            <input
                                ref={photoRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                            />
                            {editing?.photo_url && !photoFile && (
                                <div className="team-photo-preview">
                                    <img src={editing.photo_url} alt="" />
                                    <span>الصورة الحالية</span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>نبذة مختصرة</label>
                            <textarea
                                rows={2}
                                value={form.short_bio}
                                onChange={(e) => setForm({ ...form, short_bio: e.target.value })}
                                placeholder="وصف قصير يظهر تحت اسم العضو"
                            />
                        </div>

                        <div className="form-group">
                            <label>السيرة الذاتية الكاملة</label>
                            <RichTextEditor
                                key={editing?.id ?? 'new'}
                                value={form.full_bio}
                                onChange={(val) => setForm((prev) => ({ ...prev, full_bio: val }))}
                                placeholder="اكتب السيرة الذاتية التفصيلية هنا..."
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary" disabled={submitting}>
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>الصورة</th>
                            <th>الاسم</th>
                            <th>المنصب</th>
                            <th>القسم</th>
                            <th>الترتيب</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
                                لا يوجد أعضاء بعد
                            </td></tr>
                        )}
                        {members.map((m) => (
                            <tr key={m.id}>
                                <td>
                                    {m.photo_url
                                        ? <img src={m.photo_url} alt={m.name} className="team-table-avatar" />
                                        : <div className="team-avatar-placeholder" />
                                    }
                                </td>
                                <td>{m.name}</td>
                                <td>{m.role}</td>
                                <td>{m.department_title || '—'}</td>
                                <td>{m.display_order}</td>
                                <td>
                                    <div className="table-actions">
                                        <button onClick={() => startEdit(m)} className="action-btn edit">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(m.id)} className="action-btn delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Departments ────────────────────────────────────────────────────────────

const emptyDept = { title: '', display_order: 0 };

const DepartmentsTab = ({ departments, onRefresh }) => {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyDept);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await api.put(`/team/departments/${editing.id}`, form);
            } else {
                await api.post('/team/departments', form);
            }
            await onRefresh();
            resetForm();
        } catch (err) {
            const msg = err.response?.data?.error || 'فشل حفظ القسم';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
        try {
            await api.delete(`/team/departments/${id}`);
            onRefresh();
        } catch (err) {
            alert(err.response?.data?.error || 'فشل الحذف');
        }
    };

    const startEdit = (d) => {
        setEditing(d);
        setForm({ title: d.title, display_order: d.display_order });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm(emptyDept);
        setEditing(null);
        setShowForm(false);
    };

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>إدارة الأقسام</h1>
                    <p>{departments.length} قسم</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <Plus size={20} /> إضافة قسم
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>{editing ? 'تعديل القسم' : 'إضافة قسم جديد'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>اسم القسم *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                    placeholder="مثال: التدقيق العلمي"
                                />
                            </div>
                            <div className="form-group">
                                <label>ترتيب العرض</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.display_order}
                                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary" disabled={submitting}>
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم القسم</th>
                            <th>الترتيب</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((d) => (
                            <tr key={d.id}>
                                <td>{d.id}</td>
                                <td>{d.title}</td>
                                <td>{d.display_order}</td>
                                <td>
                                    <div className="table-actions">
                                        <button onClick={() => startEdit(d)} className="action-btn edit">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(d.id)} className="action-btn delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Main ───────────────────────────────────────────────────────────────────

const ManageTeam = () => {
    const [tab, setTab] = useState('members');
    const [departments, setDepartments] = useState([]);

    useEffect(() => { fetchDepartments(); }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/team/departments');
            setDepartments(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className="team-tabs">
                <button
                    className={`team-tab ${tab === 'members' ? 'active' : ''}`}
                    onClick={() => setTab('members')}
                >
                    <Users size={18} /> الأعضاء
                </button>
                <button
                    className={`team-tab ${tab === 'departments' ? 'active' : ''}`}
                    onClick={() => setTab('departments')}
                >
                    <LayoutList size={18} /> الأقسام
                </button>
            </div>

            {tab === 'members'
                ? <MembersTab departments={departments} />
                : <DepartmentsTab departments={departments} onRefresh={fetchDepartments} />
            }
        </div>
    );
};

export default ManageTeam;
