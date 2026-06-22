import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SEO from '../components/SEO';
import api from '../utils/api';
import { Skeleton } from '../components/Skeleton';
import './Team.css';

const DefaultAvatar = ({ name }) => (
    <div className="default-avatar" aria-hidden>
        {name ? name.replace(/[أإآا]/g, 'ا').trim()[0] : '؟'}
    </div>
);

const Team = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);
    const profileRef = useRef(null);

    useEffect(() => {
        api.get('/team')
            .then((res) => {
                const depts = res.data?.departments || [];
                setDepartments(depts);
                // Pre-select first member found
                for (const dept of depts) {
                    if (dept.members?.length) {
                        setSelectedMember(dept.members[0]);
                        break;
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const allMembers = useMemo(() => departments.flatMap((d) => d.members || []), [departments]);

    const handleSelect = useCallback((member) => {
        setSelectedMember(member);
        setTimeout(() => {
            profileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }, []);

    return (
        <div className="team-page">
            <SEO
                title="فريق العمل"
                description="فريق العمل في مشروع إضاءات: نخبة من أهل الاختصاص الشرعي والفكري والاجتماعي."
                keywords="فريق إضاءات, باحثون شرعيون, خالد مصطفى"
            />
            <div className="container">
                <section className="section-title">
                    <h1>فريق العمل</h1>
                    <p>اضغط على أي عضو لعرض صورته وملخص عنه وسيرته الذاتية.</p>
                </section>

                {/* Org Tree */}
                <section className="team-tree">
                    <div className="tree-root">إضاءات</div>
                    <div className="tree-vision">وعي - بناء - إصلاح</div>
                    <div className="tree-mission">بناء رؤية إصلاحية متوازنة لمعالجة قضايا الفرد والأسرة والمجتمع</div>
                    <div className="tree-owner">إعداد: أ/ خالد مصطفى محمود</div>

                    <div className="tree-grid">
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                <div className="tree-card" key={i}>
                                    <Skeleton height="2.5rem" />
                                    <div style={{ padding: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                                        <Skeleton height="3.5rem" />
                                        <Skeleton height="3.5rem" />
                                    </div>
                                </div>
                            ))
                            : departments.map((dept) => (
                                <article className="tree-card" key={dept.id}>
                                    <h3>{dept.title}</h3>
                                    <div className="member-list">
                                        {dept.members.length === 0
                                            ? <div className="empty-branch">لم يتم إضافة أعضاء بعد</div>
                                            : dept.members.map((m) => {
                                                const isSelected = selectedMember?.id === m.id;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={m.id}
                                                        className={`member-btn ${isSelected ? 'active' : ''}`}
                                                        onClick={() => handleSelect(m)}
                                                    >
                                                        {m.photo_url
                                                            ? <img src={m.photo_url} alt={m.name} className="member-avatar" loading="lazy" />
                                                            : <DefaultAvatar name={m.name} />
                                                        }
                                                        <span className="member-name">{m.name}</span>
                                                        <span className="member-role">{m.role}</span>
                                                        <span className="member-more">اضغط لعرض السيرة</span>
                                                    </button>
                                                );
                                            })
                                        }
                                    </div>
                                </article>
                            ))
                        }
                    </div>
                </section>

                {/* Member Profile */}
                {selectedMember && (
                    <section className="member-profile" aria-live="polite" ref={profileRef}>
                        <div className="profile-head">
                            {selectedMember.photo_url
                                ? <img src={selectedMember.photo_url} alt={selectedMember.name} className="profile-photo" loading="lazy" />
                                : <DefaultAvatar name={selectedMember.name} />
                            }
                            <div>
                                <h2>{selectedMember.name}</h2>
                                <h3>{selectedMember.role}</h3>
                                {selectedMember.short_bio && (
                                    <p className="bio-lead">{selectedMember.short_bio}</p>
                                )}
                            </div>
                        </div>

                        {selectedMember.full_bio
                            ? <div
                                className="bio-content prose"
                                dangerouslySetInnerHTML={{ __html: selectedMember.full_bio }}
                              />
                            : <p className="bio-note">
                                السيرة التفصيلية لهذا العضو قيد الإضافة.
                              </p>
                        }
                    </section>
                )}

                {!loading && allMembers.length === 0 && (
                    <div className="team-empty">
                        <p>لم يتم إضافة أعضاء الفريق بعد.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Team;
