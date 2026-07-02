import React from "react";

/* PageHeader
   Use at the top of any admin page:
   <PageHeader title="Rooms" description="Manage rooms and occupancy" actions={<button />} /> */
export const PageHeader = ({ title, description, eyebrow, actions }) => (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
            {eyebrow && (
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--pg-primary)" }}>
                    {eyebrow}
                </p>
            )}
            <h1 className="pg-page-title">{title}</h1>
            {description && <p className="pg-page-subtitle">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
);

/* ThemePanel
   Wrap form/table/report sections with this component to get the migrated card style. */
export const ThemePanel = ({ title, description, actions, children, className = "" }) => (
    <section className={`pg-card p-5 sm:p-6 ${className}`}>
        {(title || description || actions) && (
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    {title && <h2 className="pg-section-title">{title}</h2>}
                    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
        )}
        {children}
    </section>
);

/* StatCard
   Use for dashboard numbers. Pass a lucide icon component through the icon prop. */
export const StatCard = ({ title, value, detail, icon: Icon, tone = "primary" }) => {
    const toneClass = {
        primary: "bg-purple-50 text-purple-700",
        info: "bg-sky-50 text-sky-700",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-rose-50 text-rose-700",
        slate: "bg-slate-100 text-slate-700",
    }[tone];

    return (
        <article className="pg-card pg-card-hover p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500">{title}</p>
                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
                    {detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}
                </div>
                {Icon && (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${toneClass}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                )}
            </div>
        </article>
    );
};

/* StatusBadge
   Use in lists/tables for small status labels: <StatusBadge tone="success">Active</StatusBadge> */
export const StatusBadge = ({ children, tone = "slate" }) => {
    const toneClass = {
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-rose-50 text-rose-700",
        primary: "bg-purple-50 text-purple-700",
        slate: "bg-slate-100 text-slate-700",
    }[tone];

    return <span className={`pg-badge ${toneClass}`}>{children}</span>;
};
