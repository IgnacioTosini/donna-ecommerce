import { Breadcrumb } from '@/components/shared/breadcrumb/Breadcrumb';
import './_categoryHeader.scss';

interface Props {
    activeCategory?: {
        name: string;
        description?: string | null;
    };
}

export const CategoryHeader = ({ activeCategory }: Props) => {
    return (
        <section className="category-header">
            <section className="category-header-content">
                <Breadcrumb activeCategory={activeCategory} />
                <h1 className="category-title">{activeCategory?.name ?? "Productos"}</h1>
                {activeCategory?.description && (
                    <p className="category-description">
                        {activeCategory.description}
                    </p>
                )}
            </section>
        </section>
    )
}
