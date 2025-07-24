import { User, Project } from '@/types/index';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { PageProps } from '@/types/index';
import { FormEventHandler, useEffect, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Setting } from '@/types/models';

interface SettingsPageProps extends PageProps {
  settings: Setting[];
}

export default function Index({ auth, settings }: SettingsPageProps) {
  // Registration settings
  const registrationSetting = settings.find(s => s.key === 'registration_enabled');
  const isRegistrationEnabled = registrationSetting?.value === 'true';

  // Maintenance mode settings
  const maintenanceModeSetting = settings.find(s => s.key === 'maintenance_mode');
  const maintenanceMessageSetting = settings.find(s => s.key === 'maintenance_message');
  const isMaintenanceModeEnabled = maintenanceModeSetting?.value === 'true';
  const maintenanceMessage = maintenanceMessageSetting?.value || '';

  // IP restriction settings
  const ipRestrictionSetting = settings.find(s => s.key === 'ip_restriction_enabled');
  const allowedIpsSetting = settings.find(s => s.key === 'allowed_ips');
  const isIpRestrictionEnabled = ipRestrictionSetting?.value === 'true';
  const allowedIps = allowedIpsSetting?.value || '';

  // Registration form
  const registrationForm = useForm({
    enabled: isRegistrationEnabled,
  });

  // Maintenance mode form
  const maintenanceForm = useForm({
    enabled: isMaintenanceModeEnabled,
    message: maintenanceMessage,
  });

  // IP restriction form
  const ipRestrictionForm = useForm({
    enabled: isIpRestrictionEnabled,
    allowed_ips: allowedIps,
  });

  const submitRegistration: FormEventHandler = (e) => {
    e.preventDefault();
    registrationForm.post(route('admin.settings.registration'));
  };

  const submitMaintenance: FormEventHandler = (e) => {
    e.preventDefault();
    maintenanceForm.post(route('admin.settings.maintenance'));
  };

  const submitIpRestriction: FormEventHandler = (e) => {
    e.preventDefault();
    ipRestrictionForm.post(route('admin.settings.ip-restriction'));
  };

  return (
    <AdminLayout
      auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
      title="Application Settings"
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Application Settings</h2>}
    >
      <Head title="Application Settings" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Registration Settings */}
          <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <section className="max-w-xl">
              <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">User Registration</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Enable or disable user registration on the site.
                </p>
              </header>

              <form onSubmit={submitRegistration} className="mt-6 space-y-6">
                <div className="flex items-center">
                  <InputLabel htmlFor="registration_enabled" value="Enable User Registration" className="mr-4 text-gray-700 dark:text-gray-300" />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="registration_enabled"
                      checked={registrationForm.data.enabled}
                      onChange={(e) => registrationForm.setData('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <InputError message={registrationForm.errors.enabled} className="mt-2" />

                <div className="flex items-center gap-4">
                  <PrimaryButton disabled={registrationForm.processing}>Save</PrimaryButton>
                </div>
              </form>
            </section>
          </div>

          {/* Maintenance Mode Settings */}
          <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <section className="max-w-xl">
              <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Maintenance Mode</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Enable or disable site-wide maintenance mode with a custom message.
                </p>
              </header>

              <form onSubmit={submitMaintenance} className="mt-6 space-y-6">
                <div className="flex items-center">
                  <InputLabel htmlFor="maintenance_enabled" value="Enable Maintenance Mode" className="mr-4 text-gray-700 dark:text-gray-300" />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="maintenance_enabled"
                      checked={maintenanceForm.data.enabled}
                      onChange={(e) => maintenanceForm.setData('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <InputError message={maintenanceForm.errors.enabled} className="mt-2" />

                <div>
                  <InputLabel htmlFor="maintenance_message" value="Maintenance Message" className="text-gray-700 dark:text-gray-300" />
                  <textarea
                    id="maintenance_message"
                    value={maintenanceForm.data.message}
                    onChange={(e) => maintenanceForm.setData('message', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                    rows={3}
                    placeholder="Enter maintenance message..."
                  />
                  <InputError message={maintenanceForm.errors.message} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                  <PrimaryButton disabled={maintenanceForm.processing}>Save</PrimaryButton>
                </div>
              </form>
            </section>
          </div>

          {/* IP Restriction Settings */}
          <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <section className="max-w-xl">
              <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">IP Restrictions</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Restrict admin access to specific IP addresses.
                </p>
              </header>

              <form onSubmit={submitIpRestriction} className="mt-6 space-y-6">
                <div className="flex items-center">
                  <InputLabel htmlFor="ip_restriction_enabled" value="Enable IP Restrictions" className="mr-4 text-gray-700 dark:text-gray-300" />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="ip_restriction_enabled"
                      checked={ipRestrictionForm.data.enabled}
                      onChange={(e) => ipRestrictionForm.setData('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <InputError message={ipRestrictionForm.errors.enabled} className="mt-2" />

                <div>
                  <InputLabel htmlFor="allowed_ips" value="Allowed IP Addresses" className="text-gray-700 dark:text-gray-300" />
                  <TextInput
                    id="allowed_ips"
                    type="text"
                    value={ipRestrictionForm.data.allowed_ips}
                    onChange={(e) => ipRestrictionForm.setData('allowed_ips', e.target.value)}
                    className="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder="e.g. 192.168.1.1, 10.0.0.1"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter comma-separated IP addresses</p>
                  <InputError message={ipRestrictionForm.errors.allowed_ips} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                  <PrimaryButton disabled={ipRestrictionForm.processing}>Save</PrimaryButton>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 