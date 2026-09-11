'use client';

import { useId, useRef } from 'react';
import './shopping-help.scss';

export function SizeGuide({ guide, productName }: { guide?: string | null; productName: string }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    if (!guide?.trim()) return null;
    return <>
        <button type="button" className="shopping-help-link" onClick={() => dialog.current?.showModal()}>Ver guía de talles y medidas</button>
        <dialog ref={dialog} className="size-guide-dialog" aria-labelledby={titleId}>
            <h2 id={titleId}>Guía de talles</h2>
            <p>{productName}</p>
            <div className="size-guide-text">{guide}</div>
            <form method="dialog"><button type="submit">Cerrar guía</button></form>
        </dialog>
    </>;
}
