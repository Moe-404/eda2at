import React, { useMemo, useRef, useState } from 'react';
import founderPlaceholder from '../assets/idaat logo.png';
import khaledPhoto from '../assets/خالد مصطفي.jpeg';
import hamzaPhoto from '../assets/حمزه.jpeg';
import alaaPhoto from '../assets/علاء.jpeg';
import yusufPhoto from '../assets/يوسف .jpeg';
import mohamedAnwarPhoto from '../assets/محمد انور .jpeg';
import './Team.css';

const members = {
    founder: {
        id: 'founder',
        name: 'أ/ خالد مصطفى محمود',
        role: 'مؤسس الموقع والقائم على مشروعات إضاءات',
        image: khaledPhoto,
        shortBio: 'باحث شرعي يعمل على بناء رؤية إصلاحية شاملة للفرد والأسرة والمجتمع.',
        details: {
            intro: [
                'الحمد لله الذي هدانا سبيل الرشاد، وجعل العلم نورا يبدد الجهالة، وطريقا يهدي إلى الصلاح والإصلاح، وأشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن سيدنا محمد صلى الله عليه وسلم القائل: «من يرد الله به خيرا يفقهه في الدين».',
                'إن الاشتغال بالعلم وتعظيمه ليس شرفا معرفيا فحسب، بل هو عبادة تهذب المقاصد، وتزكي النفس، وتبني الوعي الذي تصلح به المجتمعات.',
            ],
            sections: [
                {
                    title: 'البيانات الأساسية',
                    list: [
                        'الاسم: خالد مصطفى محمود',
                        'العمر: 59 عاما',
                        'الحالة الاجتماعية: متزوج، وأب لابنين وبنتين',
                    ],
                },
                {
                    title: 'المنهج العلمي والرؤية الشرعية',
                    text: 'يقوم المنهج العلمي على الرجوع إلى نصوص الوحيين: كتاب الله تعالى وسنة رسوله صلى الله عليه وسلم، مع اعتماد علوم الأصول وفقه المقاصد، والنظر في العرف الصحيح والمآلات والمصالح الشرعية المعتبرة.',
                },
                {
                    title: 'الرحلة العلمية في طلب العلم',
                    text: 'انطلقت الرحلة العلمية قبل 29 عاما؛ بداية بما يقيم العبد دينه، ثم بأصول العلم، ثم بالتوسع في مذاهب الفقهاء ومصنفاتهم، مع لقاء عدد من كبار العلماء في أنحاء العالم الإسلامي.',
                },
                {
                    title: 'الشيوخ الذين تلقى عنهم',
                    list: [
                        'فضيلة الشيخ عدنان العرعور',
                        'فضيلة الشيخ زكريا حسيني الأزهري',
                        'الشيخ أمجد غانم',
                        'الشيخ محمود أحمد راشد',
                    ],
                },
                {
                    title: 'اللقاءات العلمية مع كبار العلماء',
                    list: [
                        'فضيلة الشيخ صفوت نور الدين',
                        'فضيلة الشيخ أبو الحسن المأربي',
                        'سماحة الإمام ابن باز',
                        'فضيلة الشيخ ابن عثيمين - رحمهما الله -',
                        'الشيخ الدكتور عبد المحسن العبيكان',
                        'الشيخ الدكتور سعد البريك - رحمه الله -',
                        'الشيخ عيد العباسي',
                    ],
                },
                {
                    title: 'مشايخ الأزهر الذين تأثر بهم',
                    list: [
                        'الأستاذ الدكتور الحبيب محمد المسير - رحمه الله',
                        'الدكتور باسل عامر',
                        'الأستاذ الدكتور إبراهيم شعيب',
                        'الدكتور عبد الله سمك',
                        'الدكتور عبد الملك الزغبي',
                        'الدكتور محمد الصغير',
                    ],
                },
                {
                    title: 'الخبرات العملية',
                    list: [
                        'الإصلاح والوساطة الشرعية في النزاعات الزوجية والعائلية والتجارية.',
                        'مراجعة عقود التمويل والمعاملات المالية المعاصرة.',
                        'مشاركات إعلامية متفرقة مع التركيز على المقصد العلمي.',
                    ],
                },
                {
                    title: 'المشروعات الإصلاحية',
                    text: 'مشروع إضاءات مشروع إصلاحي يهدف إلى تقديم حلول شرعية علمية للمشكلات المعاصرة بالاعتماد على المقاصد، والعرف، والمآلات، والمصالح المعتبرة.',
                },
            ],
        },
    },
    yassar: {
        id: 'yassar',
        name: 'أ/ حمزه',
        role: 'لجنة الإفتاء والبحث العلمي',
        image: hamzaPhoto,
        shortBio: 'يساهم في مراجعة المحتوى الشرعي ودعم مسارات البحث العلمي داخل المشروع.',
        details: {
            intro: ['عضو فعّال في لجنة الإفتاء والبحث العلمي، ويشارك في دراسة النوازل والقضايا المعاصرة.'],
            sections: [],
        },
    },
    hesham: {
        id: 'hesham',
        name: 'أ/ علاء',
        role: 'لجنة الإفتاء والبحث العلمي',
        image: alaaPhoto,
        shortBio: 'يدعم بناء الفتاوى البحثية ويشارك في صياغة المخرجات العلمية للفريق.',
        details: {
            intro: ['يعمل على الإسناد العلمي والتحرير البحثي بما يخدم رسالة إضاءات.'],
            sections: [],
        },
    },
    yusuf: {
        id: 'yusuf',
        name: 'أ/ يوسف',
        role: 'التصميمات والإعلام',
        image: yusufPhoto,
        shortBio: 'مسؤول عن تطوير الهوية البصرية وإخراج المواد الإعلامية للمشروع.',
        details: {
            intro: ['يساهم في تصميم المواد التعريفية وتقديم المحتوى بأسلوب بصري مناسب للجمهور.'],
            sections: [],
        },
    },
    mohamed: {
        id: 'mohamed',
        name: 'أ/ محمد أنور',
        role: 'التصميمات والإعلام',
        image: mohamedAnwarPhoto,
        shortBio: 'يتابع أعمال النشر والإخراج الإعلامي مع الحفاظ على رسالة المشروع.',
        details: {
            intro: ['يعمل على تنسيق وتحديث المواد الإعلامية الداعمة لأنشطة فريق العمل.'],
            sections: [],
        },
    },
    esraa: {
        id: 'esraa',
        name: 'أ/ إسراء',
        role: 'التصميمات والإعلام',
        image: founderPlaceholder,
        shortBio: 'تدعم محتوى التصميم والتحرير الإعلامي في مختلف مبادرات إضاءات.',
        details: {
            intro: ['تشارك في تطوير التصاميم التحريرية ومواد التواصل الموجهة للجمهور.'],
            sections: [],
        },
    },
    amnMina: {
        id: 'amnMina',
        name: 'أ/ أمن مينا',
        role: 'الأمن ومتابعة المحتوى',
        image: founderPlaceholder,
        shortBio: 'يتابع جودة وسلامة المحتوى المنشور ويعزز الالتزام بمعايير المنصة.',
        details: {
            intro: ['يتولى مهام متابعة المحتوى ومراجعته بهدف الحفاظ على جودة العرض والانضباط.'],
            sections: [],
        },
    },
    momnBassam: {
        id: 'momnBassam',
        name: 'أ/ مؤمن بسام',
        role: 'الأمن ومتابعة المحتوى',
        image: founderPlaceholder,
        shortBio: 'يشارك في متابعة المحتوى ويدعم مسارات التدقيق والمراجعة الدورية.',
        details: {
            intro: ['عضو في فريق المراجعة والمتابعة لضمان انسيابية المحتوى واستقراره.'],
            sections: [],
        },
    },
    saraHaila: {
        id: 'saraHaila',
        name: 'أ/ سارة هائلة',
        role: 'خدمات مساندة',
        image: founderPlaceholder,
        shortBio: 'تدعم الأعمال التنظيمية والتواصل الداخلي بين فرق المشروع المختلفة.',
        details: {
            intro: ['تقوم بمهام مساندة تساعد في انتظام سير العمل بين اللجان.'],
            sections: [],
        },
    },
    nbonAnwar: {
        id: 'nbonAnwar',
        name: 'أ/ نبون أنور',
        role: 'خدمات مساندة',
        image: founderPlaceholder,
        shortBio: 'يقدّم دعما تشغيليا للفريق ويساعد في متابعة الاحتياجات اليومية.',
        details: {
            intro: ['عضو مساند يساهم في تيسير المهام التشغيلية داخل المشروع.'],
            sections: [],
        },
    },
};

const orgTree = [
    { title: 'الفريق العلمي', memberIds: ['founder'] },
    { title: 'لجنة الإفتاء والبحث العلمي', memberIds: ['yassar', 'hesham'] },
    { title: 'التصميمات والإعلام', memberIds: ['yusuf', 'mohamed', 'esraa'] },
    { title: 'الأمن ومتابعة المحتوى', memberIds: ['amnMina', 'momnBassam'] },
    { title: 'خدمات مساندة', memberIds: ['saraHaila', 'nbonAnwar'] },
];

const Team = () => {
    const [selectedMemberId, setSelectedMemberId] = useState('founder');
    const profileRef = useRef(null);
    const selectedMember = useMemo(() => members[selectedMemberId], [selectedMemberId]);
    const hasDetailedSections = selectedMember.details.sections.length > 0;

    const handleSelectMember = (memberId) => {
        setSelectedMemberId(memberId);
        setTimeout(() => {
            profileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    return (
        <div className="team-page">
            <div className="container">
                <section className="section-title">
                    <h1>فريق العمل</h1>
                    <p>اضغط على أي عضو لعرض صورته وملخص عنه وسيرته الذاتية.</p>
                </section>

                <section className="team-tree">
                    <div className="tree-root">إضاءات</div>
                    <div className="tree-vision">وعي - بناء - إصلاح</div>
                    <div className="tree-mission">بناء رؤية إصلاحية متوازنة لمعالجة قضايا الفرد والأسرة والمجتمع</div>
                    <div className="tree-owner">إعداد: أ/ خالد مصطفى محمود</div>

                    <div className="tree-grid">
                        {orgTree.map((branch) => (
                            <article className="tree-card" key={branch.title}>
                                <h3>{branch.title}</h3>
                                <div className="member-list">
                                    {branch.memberIds.map((memberId) => {
                                        const member = members[memberId];
                                        const isSelected = selectedMemberId === member.id;
                                        return (
                                            <button
                                                type="button"
                                                key={member.id}
                                                className={`member-btn ${isSelected ? 'active' : ''}`}
                                                onClick={() => handleSelectMember(member.id)}
                                            >
                                                <img src={member.image} alt={member.name} className="member-avatar" loading="lazy" />
                                                <span className="member-name">{member.name}</span>
                                                <span className="member-role">{member.role}</span>
                                                <span className="member-more">اضغط لعرض السيرة</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="member-profile" aria-live="polite" ref={profileRef}>
                    <div className="profile-head">
                        <img src={selectedMember.image} alt={selectedMember.name} className="profile-photo" loading="lazy" />
                        <div>
                            <h2>{selectedMember.name}</h2>
                            <h3>{selectedMember.role}</h3>
                            <p className="bio-lead">{selectedMember.shortBio}</p>
                            {!hasDetailedSections ? (
                                <p className="bio-note">
                                    السيرة التفصيلية لهذا العضو قيد الإضافة، ويمكنك تحديثها من بيانات الفريق.
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {selectedMember.details.intro.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}

                    {selectedMember.details.sections.map((section) => (
                        <div className="bio-box" key={section.title}>
                            <h4>{section.title}</h4>
                            {section.text ? <p>{section.text}</p> : null}
                            {section.list ? (
                                <ul>
                                    {section.list.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            ) : null}
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

export default Team;
