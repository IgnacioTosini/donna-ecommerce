import Link from "next/link";

export default function NotFound() {
    return (
        <main className="not-found-page">
            <div>
                <p>404</p>
                <h1>Pagina no encontrada</h1>
                <span>El contenido que estas buscando no existe o ya no esta disponible.</span>
                <Link href="/">Volver a la tienda</Link>
            </div>
        </main>
    );
}
