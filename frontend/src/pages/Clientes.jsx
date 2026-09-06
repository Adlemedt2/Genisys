import { useEffect, useState } from 'react';

import {
    Users,
    Plus,
    Search,
    Pencil,
    Power,
    X,
    Save,
} from 'lucide-react';

import api from '../services/api';
import { tienePermiso } from '../utils/permisos';

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [busqueda, setBusqueda] = useState('');

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [clienteEditando, setClienteEditando] = useState(null);

    const [guardando, setGuardando] = useState(false);

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const [formulario, setFormulario] = useState({
        tipo_documento: 'CC',
        numero_documento: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        observaciones: '',
        activo: true,
    });

    const cargarClientes = async () => {
        setCargando(true);
        setError('');

        try {
            const respuesta = await api.get('/clientes');

            setClientes(
                respuesta.data.clientes || []
            );
        } catch (error) {
            console.error(
                'Error cargando clientes:',
                error
            );

            setError(
                error.response?.data?.message ||
                'No fue posible cargar los clientes.'
            );
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    const limpiarFormulario = () => {
        setFormulario({
            tipo_documento: 'CC',
            numero_documento: '',
            nombre: '',
            apellido: '',
            telefono: '',
            email: '',
            direccion: '',
            ciudad: '',
            observaciones: '',
            activo: true,
        });

        setClienteEditando(null);
        setModoEdicion(false);
    };

    const abrirNuevo = () => {
        limpiarFormulario();

        setMensaje('');
        setError('');

        setModalAbierto(true);
    };

    const abrirEditar = (cliente) => {
        setClienteEditando(cliente);
        setModoEdicion(true);

        setFormulario({
            tipo_documento:
                cliente.tipo_documento || 'CC',
            numero_documento:
                cliente.numero_documento || '',
            nombre:
                cliente.nombre || '',
            apellido:
                cliente.apellido || '',
            telefono:
                cliente.telefono || '',
            email:
                cliente.email || '',
            direccion:
                cliente.direccion || '',
            ciudad:
                cliente.ciudad || '',
            observaciones:
                cliente.observaciones || '',
            activo:
                Boolean(cliente.activo),
        });

        setMensaje('');
        setError('');

        setModalAbierto(true);
    };

    const cerrarModal = () => {
        if (guardando) {
            return;
        }

        setModalAbierto(false);
        limpiarFormulario();
    };

    const cambiarCampo = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]:
                type === 'checkbox'
                    ? checked
                    : value,
        }));

        setError('');
        setMensaje('');
    };

    const guardarCliente = async (e) => {
        e.preventDefault();

        setGuardando(true);
        setError('');
        setMensaje('');

        try {
            const datos = {
                tipo_documento:
                    formulario.tipo_documento,
                numero_documento:
                    formulario.numero_documento.trim(),
                nombre:
                    formulario.nombre.trim(),
                apellido:
                    formulario.apellido.trim() || null,
                telefono:
                    formulario.telefono.trim() || null,
                email:
                    formulario.email.trim() || null,
                direccion:
                    formulario.direccion.trim() || null,
                ciudad:
                    formulario.ciudad.trim() || null,
                observaciones:
                    formulario.observaciones.trim() || null,
                activo:
                    formulario.activo,
            };

            let respuesta;

            if (
                modoEdicion &&
                clienteEditando
            ) {
                respuesta = await api.put(
                    `/clientes/${clienteEditando.id}`,
                    datos
                );
            } else {
                respuesta = await api.post(
                    '/clientes',
                    datos
                );
            }

            setMensaje(
                respuesta.data.message ||
                'Cliente guardado correctamente.'
            );

            setModalAbierto(false);
            limpiarFormulario();

            await cargarClientes();

        } catch (error) {
            console.error(
                'Error guardando cliente:',
                error
            );

            if (
                error.response?.status === 422
            ) {
                const errores =
                    error.response.data.errors;

                if (errores) {
                    const primerError =
                        Object.values(errores)[0]?.[0];

                    setError(
                        primerError ||
                        'Revisa los datos ingresados.'
                    );
                } else {
                    setError(
                        error.response?.data?.message ||
                        'Revisa los datos ingresados.'
                    );
                }
            } else {
                setError(
                    error.response?.data?.message ||
                    'No fue posible guardar el cliente.'
                );
            }
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstado = async (cliente) => {
        const accion = cliente.activo
            ? 'desactivar'
            : 'activar';

        const confirmar = window.confirm(
            `¿Deseas ${accion} al cliente "${cliente.nombre} ${cliente.apellido || ''}"?`
        );

        if (!confirmar) {
            return;
        }

        setError('');
        setMensaje('');

        try {
            const respuesta = await api.patch(
                `/clientes/${cliente.id}/estado`
            );

            setMensaje(
                respuesta.data.message ||
                'Estado actualizado correctamente.'
            );

            await cargarClientes();

        } catch (error) {
            console.error(
                'Error cambiando estado:',
                error
            );

            setError(
                error.response?.data?.message ||
                'No fue posible cambiar el estado del cliente.'
            );
        }
    };

    const clientesFiltrados = clientes.filter(
        (cliente) => {
            const texto = busqueda
                .toLowerCase()
                .trim();

            if (!texto) {
                return true;
            }

            return (
                cliente.tipo_documento
                    ?.toLowerCase()
                    .includes(texto) ||

                cliente.numero_documento
                    ?.toLowerCase()
                    .includes(texto) ||

                cliente.nombre
                    ?.toLowerCase()
                    .includes(texto) ||

                cliente.apellido
                    ?.toLowerCase()
                    .includes(texto) ||

                cliente.telefono
                    ?.toLowerCase()
                    .includes(texto) ||

                cliente.email
                    ?.toLowerCase()
                    .includes(texto)
            );
        }
    );

    return (
        <div className="dashboard-page">

            <div className="dashboard-header">
                <div>
                    <h1>Clientes</h1>

                    <p>
                        Administra los clientes de tu negocio.
                    </p>
                </div>

                {tienePermiso('clientes.crear') && (
                    <button
                        type="button"
                        className="config-save-button"
                        onClick={abrirNuevo}
                    >
                        <Plus size={18} />
                        Nuevo cliente
                    </button>
                )}
            </div>

            {mensaje && (
                <div className="config-success">
                    {mensaje}
                </div>
            )}

            {error && !modalAbierto && (
                <div className="config-error">
                    {error}
                </div>
            )}

            <div className="dashboard-panel">

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            flex: 1,
                        }}
                    >
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform:
                                    'translateY(-50%)',
                                color: '#94a3b8',
                            }}
                        />

                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) =>
                                setBusqueda(
                                    e.target.value
                                )
                            }
                            placeholder="Buscar por documento, nombre, teléfono o correo..."
                            style={{
                                width: '100%',
                                padding:
                                    '12px 14px 12px 42px',
                                border:
                                    '1px solid #e2e8f0',
                                borderRadius: '10px',
                                outline: 'none',
                                fontSize: '14px',
                                boxSizing:
                                    'border-box',
                            }}
                        />
                    </div>
                </div>

                {cargando ? (
                    <div className="empty-state">
                        <Users size={42} />

                        <h3>
                            Cargando clientes...
                        </h3>
                    </div>

                ) : clientesFiltrados.length === 0 ? (
                    <div className="empty-state">
                        <Users size={42} />

                        <h3>
                            {busqueda
                                ? 'No se encontraron clientes'
                                : 'No hay clientes registrados'}
                        </h3>

                        <p>
                            {busqueda
                                ? 'Prueba con otro término de búsqueda.'
                                : tienePermiso('clientes.crear')
                                    ? 'Crea tu primer cliente para comenzar a trabajar con el catálogo.'
                                    : 'No hay clientes disponibles para mostrar.'}
                        </p>
                    </div>

                ) : (
                    <div
                        style={{
                            overflowX: 'auto',
                        }}
                    >
                        <table
                            style={{
                                width: '100%',
                                borderCollapse:
                                    'collapse',
                            }}
                        >
                            <thead>
                                <tr>

                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding:
                                                '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color:
                                                '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Documento
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding:
                                                '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color:
                                                '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Cliente
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding:
                                                '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color:
                                                '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Teléfono
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding:
                                                '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color:
                                                '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Correo
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding:
                                                '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color:
                                                '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Ciudad
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'center',
                                            padding:
                                                '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color:
                                                '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Estado
                                    </th>

                                    <th
                                        style={{
                                            textAlign: 'center',
                                            padding:
                                                '14px 12px',
                                            borderBottom:
                                                '1px solid #e2e8f0',
                                            color:
                                                '#64748b',
                                            fontSize: '12px',
                                            textTransform:
                                                'uppercase',
                                        }}
                                    >
                                        Acciones
                                    </th>

                                </tr>
                            </thead>

                            <tbody>
                                {clientesFiltrados.map(
                                    (cliente) => (
                                        <tr
                                            key={
                                                cliente.id
                                            }
                                        >

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    fontSize:
                                                        '13px',
                                                    fontWeight:
                                                        '600',
                                                }}
                                            >
                                                <div>
                                                    {cliente.tipo_documento}{' '}
                                                    {
                                                        cliente.numero_documento
                                                    }
                                                </div>
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight:
                                                            '600',
                                                        color:
                                                            '#1e293b',
                                                    }}
                                                >
                                                    {
                                                        cliente.nombre
                                                    }{' '}
                                                    {
                                                        cliente.apellido
                                                    }
                                                </div>

                                                {cliente.direccion && (
                                                    <div
                                                        style={{
                                                            marginTop:
                                                                '3px',
                                                            fontSize:
                                                                '12px',
                                                            color:
                                                                '#94a3b8',
                                                        }}
                                                    >
                                                        {
                                                            cliente.direccion
                                                        }
                                                    </div>
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    fontSize:
                                                        '13px',
                                                    color:
                                                        '#64748b',
                                                }}
                                            >
                                                {cliente.telefono ||
                                                    '—'}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    fontSize:
                                                        '13px',
                                                    color:
                                                        '#64748b',
                                                }}
                                            >
                                                {cliente.email ||
                                                    '—'}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    fontSize:
                                                        '13px',
                                                    color:
                                                        '#64748b',
                                                }}
                                            >
                                                {cliente.ciudad ||
                                                    '—'}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    textAlign:
                                                        'center',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display:
                                                            'inline-flex',
                                                        padding:
                                                            '5px 10px',
                                                        borderRadius:
                                                            '999px',
                                                        fontSize:
                                                            '11px',
                                                        fontWeight:
                                                            '600',
                                                    }}
                                                >
                                                    {cliente.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        '15px 12px',
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    textAlign:
                                                        'center',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display:
                                                            'flex',
                                                        justifyContent:
                                                            'center',
                                                        gap: '6px',
                                                    }}
                                                >

                                                    {tienePermiso(
                                                        'clientes.editar'
                                                    ) && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                abrirEditar(
                                                                    cliente
                                                                )
                                                            }
                                                            title="Editar"
                                                            style={{
                                                                border:
                                                                    'none',
                                                                background:
                                                                    '#f1f5f9',
                                                                borderRadius:
                                                                    '8px',
                                                                padding:
                                                                    '8px',
                                                                cursor:
                                                                    'pointer',
                                                            }}
                                                        >
                                                            <Pencil
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>
                                                    )}

                                                    {tienePermiso(
                                                        'clientes.editar'
                                                    ) && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                cambiarEstado(
                                                                    cliente
                                                                )
                                                            }
                                                            title={
                                                                cliente.activo
                                                                    ? 'Desactivar'
                                                                    : 'Activar'
                                                            }
                                                            style={{
                                                                border:
                                                                    'none',
                                                                background:
                                                                    '#f1f5f9',
                                                                borderRadius:
                                                                    '8px',
                                                                padding:
                                                                    '8px',
                                                                cursor:
                                                                    'pointer',
                                                            }}
                                                        >
                                                            <Power
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>
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
                            'rgba(15, 23, 42, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '760px',
                            maxHeight:
                                'calc(100vh - 48px)',
                            overflowY: 'auto',
                            background:
                                '#ffffff',
                            borderRadius:
                                '16px',
                            boxShadow:
                                '0 20px 50px rgba(0, 0, 0, 0.15)',
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent:
                                    'space-between',
                                padding:
                                    '20px 24px',
                                borderBottom:
                                    '1px solid #e2e8f0',
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        color:
                                            '#1e293b',
                                    }}
                                >
                                    {modoEdicion
                                        ? 'Editar cliente'
                                        : 'Nuevo cliente'}
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            '5px 0 0',
                                        color:
                                            '#64748b',
                                        fontSize:
                                            '13px',
                                    }}
                                >
                                    Información del cliente
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    cerrarModal
                                }
                                disabled={
                                    guardando
                                }
                                style={{
                                    border:
                                        'none',
                                    background:
                                        '#f1f5f9',
                                    borderRadius:
                                        '8px',
                                    padding:
                                        '8px',
                                    cursor:
                                        'pointer',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                guardarCliente
                            }
                        >
                            <div className="producto-form-grid">

                                <div className="producto-form-field">
                                    <label htmlFor="cliente-tipo-documento">
                                        Tipo de documento
                                    </label>

                                    <select
                                        id="cliente-tipo-documento"
                                        className="producto-form-input"
                                        name="tipo_documento"
                                        value={
                                            formulario.tipo_documento
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        required
                                    >
                                        <option value="CC">
                                            Cédula de ciudadanía
                                        </option>

                                        <option value="NIT">
                                            NIT
                                        </option>

                                        <option value="CE">
                                            Cédula de extranjería
                                        </option>

                                        <option value="Pasaporte">
                                            Pasaporte
                                        </option>

                                        <option value="TI">
                                            Tarjeta de identidad
                                        </option>

                                        <option value="Otro">
                                            Otro
                                        </option>
                                    </select>
                                </div>

                                <div className="producto-form-field">
                                    <label htmlFor="cliente-numero-documento">
                                        Número de documento
                                    </label>

                                    <input
                                        id="cliente-numero-documento"
                                        className="producto-form-input"
                                        name="numero_documento"
                                        type="text"
                                        value={
                                            formulario.numero_documento
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Ej. 1234567890"
                                        maxLength={50}
                                        required
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label htmlFor="cliente-nombre">
                                        Nombre
                                    </label>

                                    <input
                                        id="cliente-nombre"
                                        className="producto-form-input"
                                        name="nombre"
                                        type="text"
                                        value={
                                            formulario.nombre
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Ej. Juan"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label htmlFor="cliente-apellido">
                                        Apellido
                                    </label>

                                    <input
                                        id="cliente-apellido"
                                        className="producto-form-input"
                                        name="apellido"
                                        type="text"
                                        value={
                                            formulario.apellido
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Ej. Pérez"
                                        maxLength={100}
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label htmlFor="cliente-telefono">
                                        Teléfono
                                    </label>

                                    <input
                                        id="cliente-telefono"
                                        className="producto-form-input"
                                        name="telefono"
                                        type="text"
                                        value={
                                            formulario.telefono
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Ej. 3001234567"
                                        maxLength={30}
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label htmlFor="cliente-email">
                                        Correo electrónico
                                    </label>

                                    <input
                                        id="cliente-email"
                                        className="producto-form-input"
                                        name="email"
                                        type="email"
                                        value={
                                            formulario.email
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Ej. cliente@correo.com"
                                        maxLength={150}
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label htmlFor="cliente-ciudad">
                                        Ciudad
                                    </label>

                                    <input
                                        id="cliente-ciudad"
                                        className="producto-form-input"
                                        name="ciudad"
                                        type="text"
                                        value={
                                            formulario.ciudad
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Ej. Bogotá"
                                        maxLength={100}
                                    />
                                </div>

                                <div className="producto-form-field">
                                    <label htmlFor="cliente-direccion">
                                        Dirección
                                    </label>

                                    <input
                                        id="cliente-direccion"
                                        className="producto-form-input"
                                        name="direccion"
                                        type="text"
                                        value={
                                            formulario.direccion
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Ej. Calle 10 # 20-30"
                                        maxLength={200}
                                    />
                                </div>

                                <div className="producto-form-field producto-form-field-full">
                                    <label htmlFor="cliente-observaciones">
                                        Observaciones
                                    </label>

                                    <textarea
                                        id="cliente-observaciones"
                                        className="producto-form-textarea"
                                        name="observaciones"
                                        value={
                                            formulario.observaciones
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                        placeholder="Observaciones del cliente"
                                        rows="4"
                                    />
                                </div>

                                <label className="producto-form-checkbox">
                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={
                                            formulario.activo
                                        }
                                        onChange={
                                            cambiarCampo
                                        }
                                    />

                                    <span>
                                        Cliente activo
                                    </span>
                                </label>

                                {error && (
                                    <div
                                        className="config-error"
                                        style={{
                                            gridColumn:
                                                '1 / -1',
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}

                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent:
                                        'flex-end',
                                    gap: '10px',
                                    padding:
                                        '18px 24px',
                                    borderTop:
                                        '1px solid #e2e8f0',
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
                                        border:
                                            '1px solid #e2e8f0',
                                        background:
                                            '#ffffff',
                                        borderRadius:
                                            '9px',
                                        padding:
                                            '10px 16px',
                                        cursor:
                                            'pointer',
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="config-save-button"
                                    disabled={
                                        guardando
                                    }
                                >
                                    <Save size={17} />

                                    {guardando
                                        ? 'Guardando...'
                                        : 'Guardar cliente'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Clientes;