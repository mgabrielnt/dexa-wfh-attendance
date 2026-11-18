import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Spinner';
import { useAttendances, useDailySummary } from '@/features/attendance/attendance-queries';
import { AttendancePhotoModal } from '@/features/attendance/components/AttendancePhotoModal';
import { useEmployees } from '@/features/employees/employee-queries';
import { AdminPageHeader } from '@/layouts/AdminPageHeader';
import { todayIso } from '@/lib/datetime';
import { Attendance } from '@/types/api';
import { AttendanceCard } from './components/AttendanceCard';
import { AttendanceDetailPanel } from './components/AttendanceDetailPanel';
import { EmployeeCard } from './components/EmployeeCard';

const PREVIEW_EMPLOYEES = 4;
const PREVIEW_ATTENDANCES = 3;

function SectionHeader({
  title,
  subtitle,
  link,
}: {
  title: string;
  subtitle: string;
  link: { to: string; label: string };
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[22px] font-semibold">{title}</h2>
        <p className="text-xs font-medium text-muted">{subtitle}</p>
      </div>
      <Link
        to={link.to}
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink"
      >
        {link.label} <Icon name="arrowRight" size={14} />
      </Link>
    </div>
  );
}

export function DashboardPage() {
  const today = todayIso();
  const [selectedId, setSelectedId] = useState<number>();
  const [photoPreview, setPhotoPreview] = useState<Attendance | null>(null);

  const { data: summary } = useDailySummary();
  const { data: employees, isLoading: loadingEmployees } = useEmployees({
    status: 'ACTIVE',
    limit: PREVIEW_EMPLOYEES,
  });
  const { data: attendances, isLoading: loadingAttendances } = useAttendances({
    from: today,
    to: today,
    limit: PREVIEW_ATTENDANCES,
  });

  const todayList = attendances?.data ?? [];
  const selected = todayList.find((item) => item.id === selectedId) ?? todayList[0] ?? null;

  return (
    <>
      <AdminPageHeader title="KEHADIRAN" />

      <div className="grid gap-6 xl:grid-cols-[1fr_370px]">
        <div className="min-w-0">
          <SectionHeader
            title="Data Karyawan"
            subtitle={`${employees?.meta.total ?? 0} karyawan aktif · master data`}
            link={{ to: '/admin/employees', label: 'Kelola karyawan' }}
          />
          {loadingEmployees ? (
            <div className="grid h-48 place-items-center text-muted">
              <Spinner />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {employees?.data.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </div>
          )}

          <div className="mt-8">
            <SectionHeader
              title="Absensi Hari Ini"
              subtitle={`${summary?.checkedIn ?? 0} absen masuk · data dari karyawan`}
              link={{ to: '/admin/attendances', label: 'Semua absensi' }}
            />
            <Chip tone="dark" size="md" className="mb-4">
              <Icon name="eye" size={14} /> Hanya lihat
            </Chip>
            {loadingAttendances ? (
              <div className="grid h-48 place-items-center text-muted">
                <Spinner />
              </div>
            ) : todayList.length === 0 ? (
              <p className="card p-10 text-center text-sm font-medium text-muted">
                Belum ada karyawan yang absen hari ini.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {todayList.map((attendance) => (
                  <AttendanceCard
                    key={attendance.id}
                    attendance={attendance}
                    selected={attendance.id === selected?.id}
                    onSelect={() => setSelectedId(attendance.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <AttendanceDetailPanel attendance={selected} onOpenPhoto={setPhotoPreview} />
      </div>

      <AttendancePhotoModal attendance={photoPreview} onClose={() => setPhotoPreview(null)} />
    </>
  );
}
