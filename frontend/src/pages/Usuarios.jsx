import { useEffect, useState } from 'react';
import {
    Users,
    Plus,
    Pencil,
    Power,
    X,
    Save,
} from 'lucide-react';
import api from '../services/api';
import { tienePermiso } from '../utils/permisos';

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [empresas, setEmpresas] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const [formulario, setFormulario] = useState({
        name: '',
        email: '',
        password: '',
        empresa_id: '',
        rol_id: '',
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError('');

            const [usuariosResponse, rolesResponse, empresasResponse] =
                await Promise.all([
                    api.get('/usuarios'),
                    api.get('/roles'),
                    api.get('/usuarios-empresas'),
                ]);

            setUsuarios(usuariosResponse.data.usuarios || []);
            setRoles(rolesResponse.data.roles || []);
            setEmpresas(empresasResponse.data.empresas || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                'No fue posible cargar la información de usuarios.'
            );
        } finally {
            setCargando(false);
        }
    };

    const abrirCrear = () => {
        setUsuarioEditando(null);

        setFormulario({
            name: '',
            email: '',
            password: '',
            empresa_id: '',
            rol_id: '',
        });

        setMensaje('');
        setError('');
        setModalAbierto(true);
    };

    const abrirEditar = (usuario) => {
        setUsuarioEditando(usuario);

        setFormulario({
            name: usuario.name || '',
            email: usuario.email || '',
            password: '',
            empresa_id: usuario.empresa_id
                ? String(usuario.empresa_id)
                : '',
            rol_id: usuario.roles?.[0]?.id
                ? String(usuario.roles[0].id)
                : '',
        });

        setMensaje('');
        setError('');
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        if (guardando) return;

        setModalAbierto(false);
        setUsuarioEditando(null);
    };

    const cambiarCampo = (campo, valor) => {
        setFormulario((actual) => ({
            ...actual,
            [campo]: valor,
        }));
    };

    const guardarUsuario = async (e) => {
        e.preventDefault();

        try {
            setGuardando(true);
            setMensaje('');
            setError('');

            const datos = {
                name: formulario.name,
                email: formulario.email,
                empresa_id: Number(formulario.empresa_id),
                rol_id: Number(formulario.rol_id),
            };

            if (!usuarioEditando) {
                datos.password = formulario.password;
            } else if (formulario.password.trim() !== '') {
                datos.password = formulario.password;
            }

            if (usuarioEditando) {
                await api.put(
                    `/usuarios/${usuarioEditando.id}`,
                    datos
                );

                setMensaje('Usuario actualizado correctamente.');
            } else {
                await api.post('/usuarios', datos);

                setMensaje('Usuario creado correctamente.');
            }

            await cargarDatos();

            setTimeout(() => {
                setModalAbierto(false);
                setUsuarioEditando(null);
                setMensaje('');
            }, 700);
        } catch (err) {
            console.error(err);

            const erroresValidacion = err.response?.data?.errors;

            if (erroresValidacion) {
                const primerError = Object.values(
                    erroresValidacion
                )[0]?.[0];

                setError(
                    primerError ||
                    'Hay errores en los datos ingresados.'
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    'No fue posible guardar el usuario.'
                );
            }
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstado = async (usuario) => {
        const accion = usuario.activo
            ? 'desactivar'
            : 'activar';

        const confirmado = window.confirm(
            `¿Deseas ${accion} al usuario "${usuario.name}"?`
        );

        if (!confirmado) return;

        try {
            setError('');
            setMensaje('');

            await api.patch(
                `/usuarios/${usuario.id}/estado`
            );

            setMensaje(
                usuario.activo
                    ? 'Usuario desactivado correctamente.'
                    : 'Usuario activado correctamente.'
            );

            await cargarDatos();

            setTimeout(() => {
                setMensaje('');
            }, 2500);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                'No fue posible cambiar el estado del usuario.'
            );
        }
    };

    return (
        <div className="tipos-negocio-page">

            <div className="tipos-negocio-header">
                <div>
                    <h1>Usuarios</h1>
                    <p>
                        Administra los usuarios, roles y accesos
                        de GENISYS.
                    </p>
                </div>

                {tienePermiso('usuarios.crear') && (
                    <button
                        className="tipos-negocio-primary-button"
                        onClick={abrirCrear}
                    >
                        <Plus size={18} />
                        Nuevo usuario
                    </button>
                )}
            </div>

            {mensaje && (
                <div className="tipos-negocio-message success">
                    {mensaje}
                </div>
            )}

            {error && (
                <div className="tipos-negocio-message error">
                    {error}
                </div>
            )}

            <div className="tipos-negocio-card">

                {cargando ? (
                    <div className="tipos-negocio-empty">
                        Cargando usuarios...
                    </div>
                ) : usuarios.length === 0 ? (
                    <div className="tipos-negocio-empty">
                        <Users size={42} />
                        <p>No hay usuarios registrados.</p>
                    </div>
                ) : (
                    <div className="tipos-negocio-table-container">
                        <table className="tipos-negocio-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Correo</th>
                                    <th>Empresa</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>
                                            <div className="usuario-nombre">
                                                {usuario.name}
                                            </div>
                                        </td>

                                        <td>
                                            {usuario.email}
                                        </td>

                                        <td>
                                            {usuario.empresa?.nombre || 'Sin empresa'}
                                        </td>

                                        <td>
                                            {usuario.roles?.length > 0
                                                ? usuario.roles
                                                    .map((rol) => rol.nombre)
                                                    .join(', ')
                                                : 'Sin rol'}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    usuario.activo
                                                        ? 'tipos-negocio-status activo'
                                                        : 'tipos-negocio-status inactivo'
                                                }
                                            >
                                                {usuario.activo
                                                    ? 'Activo'
                                                    : 'Inactivo'}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="tipos-negocio-actions">

                                                {tienePermiso('usuarios.editar') && (
                                                    <button
                                                        className="tipos-negocio-action-button edit"
                                                        title="Editar usuario"
                                                        onClick={() =>
                                                            abrirEditar(usuario)
                                                        }
                                                    >
                                                        <Pencil size={17} />
                                                    </button>
                                                )}
  
                                                {tienePermiso('usuarios.eliminar') && (
                                                    <button
                                                        className={
                                                            usuario.activo
                                                                ? 'tipos-negocio-action-button danger'
                                                                : 'tipos-negocio-action-button success'
                                                        }
                                                        title={
                                                            usuario.activo
                                                                ? 'Desactivar usuario'
                                                                : 'Activar usuario'
                                                        }
                                                        onClick={() =>
                                                            cambiarEstado(usuario)
                                                        }
                                                    >
                                                        <Power size={17} />
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

            {modalAbierto && (
                <div className="tipos-negocio-modal-overlay">
                    <div className="tipos-negocio-modal">

                        <div className="tipos-negocio-modal-header">
                            <div>
                                <h2>
                                    {usuarioEditando
                                        ? 'Editar usuario'
                                        : 'Nuevo usuario'}
                                </h2>

                                <p>
                                    {usuarioEditando
                                        ? 'Actualiza la información del usuario.'
                                        : 'Crea un nuevo usuario para GENISYS.'}
                                </p>
                            </div>

                            <button
                                className="tipos-negocio-modal-close"
                                onClick={cerrarModal}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={guardarUsuario}>

                            <div className="tipos-negocio-form-group">
                                <label>
                                    Nombre completo
                                </label>

                                <input
                                    type="text"
                                    value={formulario.name}
                                    onChange={(e) =>
                                        cambiarCampo(
                                            'name',
                                            e.target.value
                                        )
                                    }
                                    required
                                    maxLength={255}
                                    placeholder="Nombre del usuario"
                                />
                            </div>

                            <div className="tipos-negocio-form-group">
                                <label>
                                    Correo electrónico
                                </label>

                                <input
                                    type="email"
                                    value={formulario.email}
                                    onChange={(e) =>
                                        cambiarCampo(
                                            'email',
                                            e.target.value
                                        )
                                    }
                                    required
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>

                            <div className="tipos-negocio-form-group">
                                <label>
                                    {usuarioEditando
                                        ? 'Nueva contraseña'
                                        : 'Contraseña'}
                                </label>

                                <input
                                    type="password"
                                    value={formulario.password}
                                    onChange={(e) =>
                                        cambiarCampo(
                                            'password',
                                            e.target.value
                                        )
                                    }
                                    required={!usuarioEditando}
                                    minLength={8}
                                    placeholder={
                                        usuarioEditando
                                            ? 'Dejar vacío para conservarla'
                                            : 'Mínimo 8 caracteres'
                                    }
                                />
                            </div>

                            <div className="tipos-negocio-form-group">
                                <label>
                                    Empresa
                                </label>

                                <select
                                    value={formulario.empresa_id}
                                    onChange={(e) =>
                                        cambiarCampo(
                                            'empresa_id',
                                            e.target.value
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        Selecciona una empresa
                                    </option>

                                    {empresas.map((empresa) => (
                                        <option
                                            key={empresa.id}
                                            value={empresa.id}
                                        >
                                            {empresa.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="tipos-negocio-form-group">
                                <label>
                                    Rol
                                </label>

                                <select
                                    value={formulario.rol_id}
                                    onChange={(e) =>
                                        cambiarCampo(
                                            'rol_id',
                                            e.target.value
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        Selecciona un rol
                                    </option>

                                    {roles.map((rol) => (
                                        <option
                                            key={rol.id}
                                            value={rol.id}
                                        >
                                            {rol.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {error && (
                                <div className="tipos-negocio-message error">
                                    {error}
                                </div>
                            )}

                            {mensaje && (
                                <div className="tipos-negocio-message success">
                                    {mensaje}
                                </div>
                            )}

                            <div className="tipos-negocio-modal-footer">

                                <button
                                    type="button"
                                    className="tipos-negocio-secondary-button"
                                    onClick={cerrarModal}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="tipos-negocio-primary-button"
                                    disabled={guardando}
                                >
                                    <Save size={18} />

                                    {guardando
                                        ? 'Guardando...'
                                        : usuarioEditando
                                            ? 'Guardar cambios'
                                            : 'Crear usuario'}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Usuarios;