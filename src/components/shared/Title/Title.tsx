import './_title.scss';

interface Props {
    title: string;
    subTitle?: string;
}

export const Title = ({ title, subTitle }: Props) => {
    return (
        <div className="title-container">
            <h1 className="title-main">{title}</h1>
            {subTitle && <h2 className="title-sub">{subTitle}</h2>}
        </div>
    )
}
