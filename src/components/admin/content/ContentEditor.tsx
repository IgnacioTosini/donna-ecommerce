'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { saveContentDraft, publishContent } from '@/app/actions/site-content.action';
import { homeSchema, businessSchema, type ContentKey } from '@/lib/site-content-schema';
import { ImageService } from '@/services/ImageService';
import './content-editor.scss';

type Fields = Record<string, string | number | boolean>;
type FormValue = Record<string, Fields>;
const labels: Record<string, string> = {
    title: 'Título', eyebrow: 'Texto sobre el título', visible: 'Mostrar sección',
    description: 'Descripción', note: 'Texto complementario', image: 'Imagen', imageAlt: 'Descripción de la imagen',
    primaryText: 'Texto del botón principal', primaryLink: 'Destino del botón principal',
    secondaryText: 'Texto del botón secundario', secondaryLink: 'Destino del botón secundario',
    badge: 'Etiqueta de la imagen', badgeText: 'Texto de la etiqueta', count: 'Cantidad de productos (1 a 12)',
    heading: 'Título de presentación', secondParagraph: 'Segundo párrafo', buttonText: 'Texto del botón',
    buttonLink: 'Destino del botón', visitTitle: 'Título del contacto', visitText: 'Texto del contacto',
    shippingDetail: 'Descripción de envíos', installmentsDetail: 'Descripción de cuotas',
    contactTitle: 'Título de atención', contactDetail: 'Descripción de atención',
    name: 'Nombre del negocio', category: 'Rubro', address: 'Dirección', locality: 'Ciudad, provincia y país',
    postalCode: 'Código postal', openingDays: 'Días de atención', openingHours: 'Horarios',
    shipping: 'Texto de envíos', installments: 'Texto de cuotas', instagramUsername: 'Usuario de Instagram (sin @)',
    whatsapp: 'WhatsApp con código de país (opcional)', footerDescription: 'Presentación del negocio y descripción para buscadores',
    deliveryPolicy: 'Condiciones de entrega (confirmadas por el negocio)', exchangePolicy: 'Condiciones de cambio (confirmadas por el negocio)',
};
const sections: Record<string, string> = {
    hero: '01 · Banner principal', editorial: '02 · Presentación principal', categories: '03 · Categorías',
    featured: '04 · Productos destacados', promo: '05 · Banner promocional', arrivals: '06 · Novedades',
    collection: '07 · Banner de colección', about: '08 · Sobre el negocio', benefits: '09 · Beneficios',
    business: 'Información y contacto',
};

export function ContentEditor({ contentKey, initial }: {
    contentKey: ContentKey;
    initial: { draft: unknown; version: number; publishedAt: string | null; hasDraft: boolean };
}) {
    const [form, setForm] = useState<FormValue>(() => contentKey === 'home'
        ? homeSchema.parse(initial.draft) as unknown as FormValue
        : { business: businessSchema.parse(initial.draft) });
    const [version, setVersion] = useState(initial.version);
    const [dirty, setDirty] = useState(false);
    const [hasDraft, setHasDraft] = useState(initial.hasDraft);
    const [publishedAt, setPublishedAt] = useState(initial.publishedAt);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!dirty) return;
        const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
        const guardNavigation = (event: MouseEvent) => {
            const anchor = event.target instanceof Element ? event.target.closest('a') : null;
            if (!anchor || anchor.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (!window.confirm('Tenés cambios sin guardar. ¿Querés salir del editor y descartarlos?')) {
                event.preventDefault(); event.stopPropagation();
            }
        };
        window.addEventListener('beforeunload', warn);
        document.addEventListener('click', guardNavigation, true);
        return () => {
            window.removeEventListener('beforeunload', warn);
            document.removeEventListener('click', guardNavigation, true);
        };
    }, [dirty]);

    function change(section: string, field: string, value: string | number | boolean) {
        setForm(previous => ({ ...previous, [section]: { ...previous[section], [field]: value } }));
        setDirty(true); setMessage('');
    }

    async function save() {
        setBusy(true); setMessage(''); setFailed(false);
        try {
            const result = await saveContentDraft({ key: contentKey, version }, contentKey === 'home' ? form : form.business);
            if (!result.ok) { setFailed(true); setMessage(result.message); return; }
            setVersion(result.version); setDirty(false); setHasDraft(true);
            setMessage('Borrador guardado. Podés revisarlo en la vista previa antes de publicar.');
        } catch { setFailed(true); setMessage('No se pudo guardar. Revisá tu sesión y volvé a intentar.'); }
        finally { setBusy(false); }
    }

    async function publish() {
        setBusy(true); setMessage(''); setFailed(false);
        try {
            const result = await publishContent({ key: contentKey, version });
            if (!result.ok) { setFailed(true); setMessage(result.message); return; }
            setVersion(result.version); setPublishedAt(result.publishedAt); setHasDraft(false);
            setMessage('Cambios publicados. Ya están disponibles en la tienda.');
        } catch { setFailed(true); setMessage('No se pudo confirmar la publicación. Recargá para comprobar el estado.'); }
        finally { setBusy(false); }
    }

    async function upload(section: string, file?: File) {
        if (!file) return;
        setBusy(true); setMessage('Subiendo imagen…'); setFailed(false);
        try {
            const result = await ImageService.uploadImage(file, { folder: 'home', maxWidth: 1800, maxHeight: 1800, format: 'webp' });
            if (!result.success) throw new Error(result.error);
            change(section, 'image', result.url);
            setMessage('Imagen cargada. Guardá el borrador para conservar el cambio.');
        } catch { setFailed(true); setMessage('No se pudo subir la imagen. Intentá nuevamente.'); }
        finally { setBusy(false); }
    }

    return <section className="content-editor">
        <header>
            <p className="content-editor-kicker">Contenido de la tienda</p>
            <h1>{contentKey === 'home' ? 'Página de inicio' : 'Datos del negocio'}</h1>
            <p>{contentKey === 'home' ? 'Editá cada sección manteniendo el diseño de tu tienda.' : 'Estos datos se comparten en el inicio, el pie de página y el contacto por WhatsApp.'}</p>
        </header>
        <nav className="content-editor-tabs" aria-label="Edición de contenido">
            <Link href="/admin/inicio" aria-current={contentKey === 'home' ? 'page' : undefined}>Página de inicio</Link>
            <Link href="/admin/negocio" aria-current={contentKey === 'business' ? 'page' : undefined}>Datos del negocio</Link>
        </nav>
        <div className="content-editor-toolbar">
            <div><strong>{dirty ? 'Cambios sin guardar' : hasDraft ? 'Borrador pendiente de publicar' : 'Sin cambios pendientes'}</strong>
                <small>{publishedAt ? `Última publicación: ${new Date(publishedAt).toLocaleString('es-AR')}` : 'Se muestra el contenido inicial hasta la primera publicación.'}</small></div>
            <div className="content-editor-actions">
                <button type="button" disabled={busy || !dirty} onClick={save}>Guardar borrador</button>
                <a href="/admin/vista-previa" target="_blank" rel="noopener noreferrer" aria-disabled={dirty || busy}
                    onClick={event => { if (dirty || busy) event.preventDefault(); }}>Vista previa ↗</a>
                <button type="button" className="primary" disabled={busy || dirty || !hasDraft} onClick={publish}>Publicar cambios</button>
            </div>
        </div>
        <p className="content-editor-hint">Guardá antes de previsualizar. La vista previa reúne ambos borradores; publicar aplica solo este apartado.</p>
        {message && <p className={`content-editor-message ${failed ? 'error' : ''}`} role={failed ? 'alert' : 'status'}>{message}</p>}
        {Object.entries(form).map(([section, values], index) => <details key={section} open={index === 0 || contentKey === 'business'}>
            <summary>{sections[section]}{typeof values.visible === 'boolean' && <span>{values.visible ? 'Visible' : 'Oculta'}</span>}</summary>
            <fieldset disabled={busy}>
                <legend className="content-editor-sr">{sections[section]}</legend>
                {['hero', 'promo', 'collection'].includes(section) && <p className="content-editor-hint">Las imágenes y los textos se administran en <Link href="/admin/banners">Banners</Link>. Los cambios allí se publican directamente; este borrador controla la visibilidad de la sección.</p>}
                {section === 'featured' && <p className="content-editor-hint">Se muestran productos activos marcados como destacados en <Link href="/admin/productos">Productos</Link>.</p>}
                {section === 'business' && <p className="content-editor-hint">WhatsApp: usá el número internacional completo, sin + ni espacios. Dejalo vacío si preferís recibir consultas por Instagram.</p>}
                <div className="content-editor-fields">
                    {Object.entries(values).map(([field, value]) => <label key={field} className={typeof value === 'boolean' ? 'toggle' : ''}>
                        <span>{labels[field]}</span>
                        {typeof value === 'boolean' ? <input type="checkbox" checked={value} onChange={e => change(section, field, e.target.checked)} />
                            : typeof value === 'number' ? <input type="number" min={1} max={12} value={value} onChange={e => change(section, field, Number(e.target.value))} />
                            : /description|paragraph|visitText|policy/i.test(field) ? <textarea rows={4} maxLength={2000} value={value} onChange={e => change(section, field, e.target.value)} />
                            : <input type="text" maxLength={field.toLowerCase().includes('link') || field === 'image' ? 500 : 250} value={value} onChange={e => change(section, field, e.target.value)} />}
                    </label>)}
                </div>
                {section === 'editorial' && <label className="content-editor-upload">Subir imagen de presentación<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { void upload(section, e.target.files?.[0]); e.target.value = ''; }} /></label>}
            </fieldset>
        </details>)}
    </section>;
}
