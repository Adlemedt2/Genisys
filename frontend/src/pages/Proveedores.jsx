import {
    useEffect,
    useState,
} from 'react';

import {
    Building2,
    Plus,
    Search,
    Pencil,
    Power,
    X,
    Save,
} from 'lucide-react';

import api from '../services/api';
import { tienePermiso } from '../utils/permisos';

function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [busqueda, setBusqueda] = useState('');

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [proveedorEditando, setProveedorEditando] =
        useState(null);

    const [guardando, setGuardando] = useState(false);

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const [formulario, setFormulario] = useState({
        tipo_documento: 'NIT',
        numero_documento: '',
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        contacto: '',
        observaciones: '',
        activo: true,
    });

    const cargarProveedores = async () => {
        try {
            setCargando(true);
            setError('');

            const respuesta = await api.get('/proveedores');

            setProveedores(
                respuesta.data.proveedores ?? []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cargar los proveedores.'
            );
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarProveedores();
    }, []);

    const abrirNuevo = () => {
        setFormulario({
            tipo_documento: 'NIT',
            numero_documento: '',
            nombre: '',
            telefono: '',
            email: '',
            direccion: '',
            ciudad: '',
            contacto: '',
            observaciones: '',
            activo: true,
        });

        setProveedorEditando(null);
        setModoEdicion(false);
        setMensaje('');
        setError('');
        setModalAbierto(true);
    };

    const abrirEditar = (proveedor) => {
        setFormulario({
            tipo_documento:
                proveedor.tipo_documento ?? 'NIT',
            numero_documento:
                proveedor.numero_documento ?? '',
            nombre:
                proveedor.nombre ?? '',
            telefono:
                proveedor.telefono ?? '',
            email:
                proveedor.email ?? '',
            direccion:
                proveedor.direccion ?? '',
            ciudad:
                proveedor.ciudad ?? '',
            contacto:
                proveedor.contacto ?? '',
            observaciones:
                proveedor.observaciones ?? '',
            activo:
                proveedor.activo ?? true,
        });

        setProveedorEditando(proveedor);
        setModoEdicion(true);
        setMensaje('');
        setError('');
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        if (guardando) {
            return;
        }

        setModalAbierto(false);
        setProveedorEditando(null);
        setModoEdicion(false);
    };

    const manejarCambio = (evento) => {
        const {
            name,
            value,
            type,
            checked,
        } = evento.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]:
                type === 'checkbox'
                    ? checked
                    : value,
        }));
    };

    const guardarProveedor = async (evento) => {
        evento.preventDefault();

        try {
            setGuardando(true);
            setMensaje('');
            setError('');

            if (modoEdicion && proveedorEditando) {
                const respuesta = await api.put(
                    `/proveedores/${proveedorEditando.id}`,
                    formulario
                );

                setProveedores((anterior) =>
                    anterior.map((item) =>
                        item.id === proveedorEditando.id
                            ? respuesta.data.proveedor
                            : item
                    )
                );

                setMensaje(
                    'Proveedor actualizado correctamente.'
                );
            } else {
                const respuesta = await api.post(
                    '/proveedores',
                    formulario
                );

                setProveedores((anterior) => [
                    ...anterior,
                    respuesta.data.proveedor,
                ]);

                setMensaje(
                    'Proveedor creado correctamente.'
                );
            }

            setTimeout(() => {
                setModalAbierto(false);
                setProveedorEditando(null);
                setModoEdicion(false);
                setMensaje('');
            }, 700);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible guardar el proveedor.'
            );
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstado = async (proveedor) => {
        const accion = proveedor.activo
            ? 'desactivar'
            : 'activar';

        const confirmar = window.confirm(
            `¿Deseas ${accion} al proveedor "${proveedor.nombre}"?`
        );

        if (!confirmar) {
            return;
        }

        try {
            setMensaje('');
            setError('');

            const respuesta = await api.patch(
                `/proveedores/${proveedor.id}/estado`
            );

            setProveedores((anterior) =>
                anterior.map((item) =>
                    item.id === proveedor.id
                        ? respuesta.data.proveedor
                        : item
                )
            );

            setMensaje(
                respuesta.data.message ||
                'Estado actualizado correctamente.'
            );

            setTimeout(() => {
                setMensaje('');
            }, 2500);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cambiar el estado del proveedor.'
            );
        }
    };

    const proveedoresFiltrados =
        proveedores.filter((proveedor) => {
            const texto =
                busqueda
                    .toLowerCase()
                    .trim();

            if (!texto) {
                return true;
            }

            return [
                proveedor.tipo_documento,
                proveedor.numero_documento,
                proveedor.nombre,
                proveedor.telefono,
                proveedor.email,
                proveedor.ciudad,
                proveedor.contacto,
            ]
                .filter(Boolean)
                .some((valor) =>
                    String(valor)
                        .toLowerCase()
                        .includes(texto)
                );
        });

    return (
        <div className="dashboard-page">

            <div className="proveedores-page-header">

                <div className="proveedores-page-title">
                    <h1>Proveedores</h1>

                    <p>
                        Administra los proveedores de tu empresa.
                    </p>
                </div>

                {tienePermiso('proveedores.crear') && (
                    <button
                        type="button"
                        onClick={abrirNuevo}
                        className="config-save-button proveedores-nuevo-button"
                    >
                        <Plus size={18} />
                        Nuevo proveedor
                    </button>
                )}

            </div>

            {mensaje && (
                <div
                    style={{
                        marginBottom: '16px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: '#ecfdf5',
                        color: '#047857',
                        fontSize: '14px',
                    }}
                >
                    {mensaje}
                </div>
            )}

            {error && (
                <div
                    style={{
                        marginBottom: '16px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        fontSize: '14px',
                    }}
                >
                    {error}
                </div>
            )}

            <div className="dashboard-panel proveedores-panel">

                <div className="proveedores-panel-header">
                    <Building2 size={21} />

                    <h2>
                        Proveedores registrados
                    </h2>
                </div>

                <div className="proveedores-search">
                    <Search size={18} />

                    <input
                        type="text"
                        value={busqueda}
                        onChange={(evento) =>
                            setBusqueda(evento.target.value)
                        }
                        placeholder="Buscar proveedor..."
                        className="producto-form-input"
                    />
                </div>

                {cargando ? (
                    <div className="proveedores-empty">
                        Cargando proveedores...
                    </div>
                ) : proveedoresFiltrados.length === 0 ? (
                    <div className="proveedores-empty proveedores-empty-large">

                        <Building2
                            size={42}
                        />

                        <h3>
                            No hay proveedores
                        </h3>

                        <p>
                            {busqueda
                                ? 'No encontramos proveedores que coincidan con la búsqueda.'
                                : 'Aún no has registrado proveedores.'}
                        </p>

                    </div>
                ) : (
                    <div className="proveedores-table-wrapper">

                        <table className="proveedores-table">

                            <thead>
                                <tr>
                                    <th>Documento</th>
                                    <th>Proveedor</th>
                                    <th>Contacto</th>
                                    <th>Teléfono</th>
                                    <th>Correo</th>
                                    <th>Ciudad</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {proveedoresFiltrados.map(
                                    (proveedor) => (
                                        <tr key={proveedor.id}>

                                            <td>
                                                {proveedor.tipo_documento}{' '}
                                                {proveedor.numero_documento}
                                            </td>

                                            <td className="proveedor-nombre">
                                                {proveedor.nombre}
                                            </td>

                                            <td>
                                                {proveedor.contacto || '—'}
                                            </td>

                                            <td>
                                                {proveedor.telefono || '—'}
                                            </td>

                                            <td>
                                                {proveedor.email || '—'}
                                            </td>

                                            <td>
                                                {proveedor.ciudad || '—'}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        proveedor.activo
                                                            ? 'proveedor-estado activo'
                                                            : 'proveedor-estado inactivo'
                                                    }
                                                >
                                                    {proveedor.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="proveedores-acciones">

                                                    {tienePermiso(
                                                        'proveedores.editar'
                                                    ) && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    abrirEditar(proveedor)
                                                                }
                                                                title="Editar"
                                                                className="tipo-accion editar"
                                                            >
                                                                <Pencil size={17} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    cambiarEstado(proveedor)
                                                                }
                                                                title={
                                                                    proveedor.activo
                                                                        ? 'Desactivar'
                                                                        : 'Activar'
                                                                }
                                                                className={
                                                                    proveedor.activo
                                                                        ? 'tipo-accion desactivar'
                                                                        : 'tipo-accion activar'
                                                                }
                                                            >
                                                                <Power size={17} />
                                                            </button>
                                                        </>
                                                    )}

                                                </div>
                                            </td>

                                        </tr>
                                    )
                                )}
                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {modalAbierto && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background:
                            'rgba(15, 23, 42, 0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '760px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            background: '#ffffff',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow:
                                '0 20px 50px rgba(0,0,0,0.2)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'space-between',
                                marginBottom: '20px',
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin:
                                            '0 0 6px',
                                    }}
                                >
                                    {modoEdicion
                                        ? 'Editar proveedor'
                                        : 'Nuevo proveedor'}
                                </h2>

                                <p
                                    style={{
                                        margin: 0,
                                        color: '#64748b',
                                        fontSize:
                                            '14px',
                                    }}
                                >
                                    Completa la información
                                    del proveedor.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={cerrarModal}
                                style={{
                                    border: 'none',
                                    background:
                                        'transparent',
                                    cursor: 'pointer',
                                }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                guardarProveedor
                            }
                        >
                            <div className="producto-form-grid">

                                <div className="producto-form-field">
                                    <label>
                                        Tipo de documento
                                    </label>

                                    <select
                                        name="tipo_documento"
                                        value={
                                            formulario.tipo_documento
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        className="producto-form-input"
                                        required
                                    >
                                        <option value="NIT">
                                            NIT
                                        </option>

                                        <option value="CC">
                                            Cédula de ciudadanía
                                        </option>

                                        <option value="CE">
                                            Cédula de extranjería
                                        </option>

                                        <option value="PAS">
                                            Pasaporte
                                        </option>
                                    </select>
                                </div>

                                <div className="producto-form-field">
                                    <label>
                                        Número de documento
                                    </label>

                                    <input
                                        type="text"
                                        name="numero_documento"
                                        value={
                                            formulario.numero_documento
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        className="producto-form-input"
                                        required
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label>
                                        Nombre / razón social
                                    </label>

                                    <input
                                        type="text"
                                        name="nombre"
                                        value={
                                            formulario.nombre
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        className="producto-form-input"
                                        maxLength={150}
                                        required
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label>
                                        Persona de contacto
                                    </label>

                                    <input
                                        type="text"
                                        name="contacto"
                                        value={
                                            formulario.contacto
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        className="producto-form-input"
                                        maxLength={150}
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label>
                                        Teléfono
                                    </label>

                                    <input
                                        type="text"
                                        name="telefono"
                                        value={
                                            formulario.telefono
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        className="producto-form-input"
                                        maxLength={30}
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label>
                                        Correo electrónico
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            formulario.email
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        className="producto-form-input"
                                        maxLength={150}
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label>
                                        Dirección
                                    </label>

                                    <input
                                        type="text"
                                        name="direccion"
                                        value={
                                            formulario.direccion
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        className="producto-form-input"
                                        maxLength={200}
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label>
                                        Ciudad
                                    </label>

                                    <input
                                        type="text"
                                        name="ciudad"
                                        value={
                                            formulario.ciudad
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        className="producto-form-input"
                                        maxLength={100}
                                    />
                                </div>

                            </div>

                            <div
                                className="producto-form-field"
                                style={{
                                    marginTop: '16px',
                                }}
                            >
                                <label>
                                    Observaciones
                                </label>

                                <textarea
                                    name="observaciones"
                                    value={
                                        formulario.observaciones
                                    }
                                    onChange={
                                        manejarCambio
                                    }
                                    className="producto-form-textarea"
                                    rows={4}
                                />
                            </div>

                            <div
                                className="producto-form-checkbox"
                                style={{
                                    marginTop: '16px',
                                }}
                            >
                                <label>
                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={
                                            formulario.activo
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    />

                                    <span>
                                        Proveedor activo
                                    </span>
                                </label>
                            </div>

                            {error && (
                                <div
                                    style={{
                                        marginTop:
                                            '16px',
                                        padding:
                                            '12px 16px',
                                        borderRadius:
                                            '10px',
                                        background:
                                            '#fef2f2',
                                        color:
                                            '#b91c1c',
                                        fontSize:
                                            '14px',
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent:
                                        'flex-end',
                                    gap: '10px',
                                    marginTop: '24px',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={
                                        cerrarModal
                                    }
                                    disabled={
                                        guardando
                                    }
                                    style={{
                                        padding:
                                            '10px 16px',
                                        borderRadius:
                                            '8px',
                                        border:
                                            '1px solid #cbd5e1',
                                        background:
                                            '#ffffff',
                                        cursor:
                                            'pointer',
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        guardando
                                    }
                                    className="config-save-button"
                                >
                                    <Save size={18} />

                                    {guardando
                                        ? 'Guardando...'
                                        : 'Guardar proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Proveedores;