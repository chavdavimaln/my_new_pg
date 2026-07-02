import React, { useState } from "react";
import { Save } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { PageHeader, ThemePanel } from "../../Components/Layout/ThemeElements";
import { getPgSettings, savePgSettings } from "../../Utils/pgRequirementStore";

const SettingsPanel = () => {
    const [settings, setSettings] = useState(getPgSettings());

    const save = (event) => {
        event.preventDefault();
        savePgSettings(settings);
        alert("Settings saved");
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <PageHeader eyebrow="Settings" title="PG Settings Panel" description="Configure rent cycle, reminders, deposit rules, late fees, WhatsApp templates, and staff role defaults." />
                <ThemePanel title="Operational Settings" description="Central settings used by admissions, reminders, and accounting screens.">
                    <form className="grid gap-4 md:grid-cols-2" onSubmit={save}>
                        {[
                            ["rentCycle", "Rent cycle"],
                            ["reminderDays", "Payment reminder days"],
                            ["depositRule", "Deposit rules"],
                            ["lateFeeRule", "Late fee rules"],
                            ["whatsappProvider", "WhatsApp provider"],
                        ].map(([key, label]) => (
                            <label className="text-sm font-semibold text-slate-700" key={key}>
                                {label}
                                <input className="pg-input mt-1" value={settings[key] || ""} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} />
                            </label>
                        ))}
                        <label className="md:col-span-2 text-sm font-semibold text-slate-700">
                            WhatsApp receipt template
                            <textarea className="pg-input mt-1" rows="4" value={settings.receiptTemplate || ""} onChange={(event) => setSettings({ ...settings, receiptTemplate: event.target.value })} />
                        </label>
                        <button className="pg-button-primary md:col-span-2" type="submit"><Save size={18} /> Save Settings</button>
                    </form>
                </ThemePanel>
            </div>
        </AdminLayout>
    );
};

export default SettingsPanel;
