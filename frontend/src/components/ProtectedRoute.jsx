import { Navigate } from 'react-router-dom';
import { tienePermiso } from '../utils/permisos';

function ProtectedRoute({ children, permiso }) {
    const token = localStorage.getItem('token');

    /*
    |--------------------------------------------------------------------------
    | No hay sesión
    |--------------------------------------------------------------------------
    */

    if (!token) {
        return <Navigate to="/" replace />;
    }


    /*
    |--------------------------------------------------------------------------
    | Hay sesión pero no tiene permiso
    |--------------------------------------------------------------------------
    */

    if (permiso && !tienePermiso(permiso)) {
        return (
            <div
                style={{
                    minHeight: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                }}
            >

                <div
                    style={{
                        maxWidth: '520px',
                        width: '100%',
                        textAlign: 'center',
                        padding: '40px',
                        background: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                    }}
                >

                    <div
                        style={{
                            fontSize: '48px',
                            marginBottom: '20px',
                        }}
                    >
                        🔒
                    </div>

                    <h2
                        style={{
                            marginBottom: '12px',
                        }}
                    >
                        Acceso denegado
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            color: '#6b7280',
                            lineHeight: '1.6',
                        }}
                    >
                        No tienes permisos suficientes para acceder
                        a este módulo.
                    </p>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Usuario autorizado
    |--------------------------------------------------------------------------
    */

    return children;
}

export default ProtectedRoute;