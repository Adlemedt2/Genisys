import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
    const navigate = useNavigate();

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');

    const cerrarSesion = async () => {
        try {
            await api.post(
                '/logout',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');

            navigate('/', { replace: true });
        }
    };

    return (
        <div>
            <h1>GENISYS</h1>

            <h2>Panel principal</h2>

            <p>
                Bienvenido, {usuario?.name}
            </p>

            <p>
                Rol: {usuario?.roles?.join(', ')}
            </p>

            <button onClick={cerrarSesion}>
                Cerrar sesión
            </button>
        </div>
    );
}

export default Dashboard;