import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();

    const iniciarSesion = async (e) => {
        e.preventDefault();

        setMensaje('');

        try {
            const respuesta = await api.post('/login', {
                email,
                password,
            });

            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem(
                'usuario',
                JSON.stringify(respuesta.data.usuario)
            );
            
            navigate('/dashboard');
            
            setMensaje('Inicio de sesión exitoso');

            console.log(respuesta.data);

        } catch (error) {
            console.error('ERROR LOGIN:', error);

            setMensaje(
                error.response?.data?.message ||
                error.message ||
                'Error al iniciar sesión.'
            );
        }
    };

    return (
        <div>
            <h1>GENISYS</h1>

            <h2>Iniciar sesión</h2>

            <form onSubmit={iniciarSesion}>

                <div>
                    <label>Correo</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Contraseña</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">
                    Iniciar sesión
                </button>

            </form>

            {mensaje && <p>{mensaje}</p>}
        </div>
    );
}

export default Login;