import { Title } from '@/components/shared/Title/Title';
import { FaArrowRight, FaInstagram, FaMapMarkerAlt } from 'react-icons/fa';
import { CiClock2 } from 'react-icons/ci';
import './_aboutUs.scss';

export const AboutUs = () => {
    return (
        <div className="about-us-section">
            <div className="about-us-container">
                <Title title='Nuestra esencia' subTitle='Conoce DONNA' />
                <div className="about-us-content">
                    <div className="about-us-description">
                        <h3 className="about-us-title">Más que una tienda</h3>
                        <p className="about-us-text">DONNA nació en Río Segundo, Córdoba, como un espacio dedicado a quienes buscan calzado y ropa con identidad. Seleccionamos cada pieza pensando en la versatilidad, el confort y ese detalle que marca la diferencia. Nuestras colecciones mezclan tendencias actuales con propuestas atemporales, ideales para armar looks propios.</p>
                        <p className="about-us-text">Trabajamos con nuevos drops constantes, cuotas sin interés y envíos a todo el país para que tu próximo outfit esté siempre a un click.</p>
                        <button className="about-us-button">VER NUEVOS INGRESOS <FaArrowRight className='about-us-button-icon' /></button>
                    </div>
                    <div className="about-us-visit">
                        <h3 className="about-us-title">Visitá DONNA</h3>
                        <p className="about-us-text">Pasá por nuestro local, probate lo nuevo y descubrí las promos del día. También podés escribirnos por Instagram o WhatsApp y te asesoramos con tu pedido.</p>
                        <div className="about-us-location">
                            <FaMapMarkerAlt className='about-us-location-icon' />
                            <div className="about-us-location-text">
                                <p className='about-us-location-line'>Leandro N. Alem esq. Córdoba</p>
                                <p className='about-us-location-line'>Río Segundo, Córdoba, Argentina</p>
                            </div>
                        </div>
                        <div className="about-us-hours">
                            <CiClock2 className='about-us-hours-icon' />
                            <div className="about-us-hours-text">
                                <p className='about-us-hours-line'>Lun a Sáb</p>
                                <p className='about-us-hours-line'>9:00 a 13:00 hs | 17:00 a 21:00 hs</p>
                            </div>
                        </div>
                        <button className="about-us-button"><FaInstagram className='about-us-button-icon' />CONTACTO</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
