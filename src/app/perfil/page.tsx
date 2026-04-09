'use client';

import React from 'react';

export default function ProfilePage() {
  return (
    <>
      {/* Force light mode CSS vars and body background */}
      <style>{`
        #perfil-root {
          --color-bg: #F8F7F9;
          --color-sidebar: #FFFFFF;
          --color-accent: #A855F7;
          --color-ticket: #1A1A1A;
          --color-gray-text: #6B7280;
        }
        .perfil-body {
          background-color: #F8F7F9 !important;
          color: #1A1A1A !important;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
        }
        .perfil-font-vogue {
          font-family: 'Playfair Display', serif;
        }
        .perfil-sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          transition: all 0.2s;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6B7280;
          text-decoration: none;
        }
        .perfil-sidebar-item:hover {
          background-color: #FAF5FF;
          color: #9333EA;
        }
        .perfil-sidebar-item.active {
          background-color: #FAF5FF;
          color: #9333EA;
          border-right: 4px solid #9333EA;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        .perfil-boarding-pass {
          background-color: #1A1A1A;
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0);
          background-size: 16px 16px;
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
          display: flex;
          height: 13rem;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .perfil-boarding-pass:hover {
          transform: scale(1.01);
        }
        .perfil-pass-notch {
          position: absolute;
          width: 30px;
          height: 30px;
          background: #F8F7F9;
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        }
        .perfil-notch-left { left: -15px; }
        .perfil-notch-right { right: -15px; }
      `}</style>

      <div id="perfil-root" className="perfil-body antialiased min-h-screen flex" style={{ backgroundColor: '#F8F7F9', color: '#1A1A1A' }}>
        
        {/* SIDEBAR */}
        <aside style={{ width: '20rem', backgroundColor: '#FFFFFF', borderRight: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <div style={{ width: '6rem', height: '6rem', borderRadius: '50%', border: '2px solid #F3E8FF', padding: '4px' }}>
                <img
                  alt="Sofia R."
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjS9LSsGTPztQ9TCUsdN8xwWCiNJFUWAnLy5UEvWNIFarfFXo-7NKfdu8AoD2AqIlaB9O9zr__02G2eCSCxbmxnAMCpfJqTaRd6qqLEBxV8D9Z3tMBhLRjU_CJlO_wiFsHvWR0LQM6IAGZQljwE7QUXvXg-WY_XRiquIX1MU7pBcr9VTKOKv1K3Ubmy5j91LNPmfX3qq-LqEti5GU93_GOR3qflFnXP0TBMSpFA9PeDHOaL9-fz2EoGU06tmJPAy-AGff8hkVWd6wz"
                />
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '1.5rem', height: '1.5rem', backgroundColor: '#22C55E', border: '4px solid white', borderRadius: '50%' }}></div>
            </div>
            <span style={{ fontSize: '10px', letterSpacing: '0.3em', fontWeight: 'bold', color: '#C084FC', marginBottom: '4px', display: 'block' }}>BIENVENIDA</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Sofia R.</h2>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px', marginBottom: '2.5rem' }}>sofia.r@email.com</p>

            <nav style={{ width: '100%' }}>
              <a className="perfil-sidebar-item active" href="#" style={{ marginBottom: '4px', display: 'flex' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>calendar_today</span>
                Panel de Turnos
              </a>
              <a className="perfil-sidebar-item" href="#" style={{ marginBottom: '4px', display: 'flex' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>history</span>
                Historial de Citas
              </a>
              <a className="perfil-sidebar-item" href="#" style={{ marginBottom: '4px', display: 'flex' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>payments</span>
                Métodos de Pago
              </a>
              <a className="perfil-sidebar-item" href="#" style={{ display: 'flex' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>favorite</span>
                Favoritos
              </a>
            </nav>
          </div>

          <div style={{ marginTop: 'auto', padding: '2rem' }}>
            <a className="perfil-sidebar-item" href="#" style={{ color: '#F87171', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>logout</span>
              Cerrar Sesión
            </a>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, maxWidth: '64rem', margin: '0 auto', padding: '3rem' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1 className="perfil-font-vogue" style={{ fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.05em', textTransform: 'uppercase', color: '#1A1A1A' }}>MujerApp</h1>
            </div>
            <button style={{ position: 'relative', padding: '0.5rem', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>notifications</span>
              <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '0.5rem', height: '0.5rem', backgroundColor: '#A855F7', borderRadius: '50%', display: 'block' }}></span>
            </button>
          </header>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Mis Próximos Turnos</h2>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Tu agenda de belleza confirmada.</p>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '56rem' }}>

            {/* TICKET 1 — CASA BLANCA */}
            <div className="perfil-boarding-pass">
              <div className="perfil-pass-notch perfil-notch-left"></div>
              <div className="perfil-pass-notch perfil-notch-right"></div>
              <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: '#6B7280', fontWeight: 'bold', letterSpacing: '0.2em', marginBottom: '4px' }}>SALÓN</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.025em' }}>CASA BLANCA</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#C084FC' }}>content_cut</span>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', color: '#6B7280', fontWeight: 'bold', letterSpacing: '0.2em', marginBottom: '4px' }}>DATE</p>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.025em' }}>21/AGO</h3>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Con:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>Martina Soto</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Servicio:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>Balayage</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Hora:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>10:30am</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Seat:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>Silla 1</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Date:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>2023/08/21</p></div>
                </div>
              </div>
              <div style={{ width: '16rem', borderLeft: '1px dashed rgba(255,255,255,0.2)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <p style={{ fontSize: '8px', color: '#6B7280', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.4 }}>Código de Check-in para Martina</p>
                <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '0.75rem' }}>
                  <img alt="QR Code" style={{ width: '6rem', height: '6rem' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsqcIj4hazxG7FsZRc5FPqKheWZ-vuXVNuWAMaaV9ur_yQx3nImfF9kUR9M0LIBKUuL6Be7PrZ_Xl9cdCdXBTADDpxkYdrwMVKxVGFWYwjsKJwQ5i0Jwm15IxW4bOeh6qu1a85XzrKEGuoYB64SeJ0EaSJwuhCMHRx1goXPy5BfCSgETOZ4VJGVlr9OPQCM4RuGwbqKqZ2Z_5qiCjiqK3GsUb0s1RabjJfoOCOYLtU_2Xe3V-t-9GxfM_EabVJ38Ih497zuFyXs8B-"/>
                </div>
                <p style={{ marginTop: '0.75rem', fontSize: '10px', fontFamily: 'monospace', color: '#6B7280' }}>#MB-2023-CB01</p>
              </div>
            </div>

            {/* TICKET 2 — AURA WELLNESS */}
            <div className="perfil-boarding-pass">
              <div className="perfil-pass-notch perfil-notch-left"></div>
              <div className="perfil-pass-notch perfil-notch-right"></div>
              <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: '#6B7280', fontWeight: 'bold', letterSpacing: '0.2em', marginBottom: '4px' }}>SPA</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.025em' }}>AURA WELLNESS</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#C084FC' }}>spa</span>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', color: '#6B7280', fontWeight: 'bold', letterSpacing: '0.2em', marginBottom: '4px' }}>DATE</p>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.025em' }}>23/AGO</h3>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Con:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>Javier Gomez</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Servicio:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>Faciales</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Hora:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>3:00pm</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Cabin:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>Lounge 4</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Date:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>2023/08/23</p></div>
                </div>
              </div>
              <div style={{ width: '16rem', borderLeft: '1px dashed rgba(255,255,255,0.2)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <p style={{ fontSize: '8px', color: '#6B7280', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.4 }}>Código de Check-in para Javier</p>
                <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '0.75rem' }}>
                  <img alt="QR Code" style={{ width: '6rem', height: '6rem' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwUJUHgFSa6IvonVFlkWd98U1pi3MTZiUw7P7NDJiD3EjEMMsRN_2dODLDYa9lk7M2YBTC7E4nA_DkNEIrrER8FRlcWo_yPSQ9lnbeWSmEvrdYEpIGuGVuczhGlSo1u2CDLzBXd33dyTvPa0kazzAorzz3kq7fU5S4suDt7ZYeElTyNt7z2-DoYsXptMW9YHj-TpcqNbz4LLOisrLw0CTj38r1tOpSArO7IOlCi93wOYPCQN30I2y4f-QbNxoc8moWKUQuLvFBn6q9"/>
                </div>
                <p style={{ marginTop: '0.75rem', fontSize: '10px', fontFamily: 'monospace', color: '#6B7280' }}>#MB-2023-AW02</p>
              </div>
            </div>

            {/* TICKET 3 — STUDIO MINIMAL */}
            <div className="perfil-boarding-pass">
              <div className="perfil-pass-notch perfil-notch-left"></div>
              <div className="perfil-pass-notch perfil-notch-right"></div>
              <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: '#6B7280', fontWeight: 'bold', letterSpacing: '0.2em', marginBottom: '4px' }}>STUDIO</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.025em' }}>STUDIO MINIMAL</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span className="material-symbols-outlined" style={{ color: '#C084FC' }}>front_loader</span>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', color: '#6B7280', fontWeight: 'bold', letterSpacing: '0.2em', marginBottom: '4px' }}>DATE</p>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.025em' }}>26/AGO</h3>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Con:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>Ana Lopez</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Servicio:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>Manicure</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Hora:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>11:15am</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Seat:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>Puesto 2</p></div>
                  <div><p style={{ fontSize: '9px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Date:</p><p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>2023/08/26</p></div>
                </div>
              </div>
              <div style={{ width: '16rem', borderLeft: '1px dashed rgba(255,255,255,0.2)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <p style={{ fontSize: '8px', color: '#6B7280', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.4 }}>Código de Check-in para Ana</p>
                <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '0.75rem' }}>
                  <img alt="QR Code" style={{ width: '6rem', height: '6rem' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfaaFId9EUvB0ZZnBM9nhvNyQwQGNZH3jQJY-77PRm5UZ18qEVAz-swoRRzfb4-AcqVwHiIHctlLrJYCCwkCBCmZks3KuSagkqvOda1F_Qeb-0K28N1MB-f8-tJWMF1Yekv6SNozBiUpDNO6KhAzjhiL10ZObSZW3zZsWnKho3RyytPEGnR9iqhmBFzONG5rz96ddJTiVIP3Kl2eqQxnx5Jx7qj2TRhh2srVDHaMQFF_RdDW1AHO7NbzyUgurYHbZ0oYQGubQvwPQX"/>
                </div>
                <p style={{ marginTop: '0.75rem', fontSize: '10px', fontFamily: 'monospace', color: '#6B7280' }}>#MB-2023-SM03</p>
              </div>
            </div>

          </div>
        </main>

        {/* BACKGROUND DECOR */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1, opacity: 0.5 }}>
          <div style={{ position: 'absolute', top: '20%', right: '10%', width: '400px', height: '400px', backgroundColor: '#F3E8FF', borderRadius: '50%', filter: 'blur(120px)' }}></div>
          <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '300px', height: '300px', backgroundColor: '#EEF2FF', borderRadius: '50%', filter: 'blur(100px)' }}></div>
        </div>

      </div>
    </>
  );
}
