import Link from 'next/link';
import './_dashboardItem.scss';

interface Props {
    title: string;
    count: string | number;
    icon: React.ReactNode;
    href?: string;
}

export const DashboardItem = ({ title, count, icon, href }: Props) => {
    return (
        <Link href={href || '#'} className="dashboard-item">
            <div className="dashboard-item-content">
                <h3 className="dashboard-item-title">{title}</h3>
                <p className="dashboard-item-count">{count}</p>
            </div>
            <div className="dashboard-item-icon">{icon}</div>
        </Link>
    )
}
