import { useEffect, useState } from 'react';
import {
    Store,
    Plus,
    Pencil,
    Power,
    X,
    Save,
} from 'lucide-react';

import api from '../services/api';

function TiposNegocio() {

    const [tipos, setTipos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const [tipoEditando, setTipoEditando] = useState(null);

    const [formulario, setFormulario] = useState({
        nombre: '',
        descripcion: '',
    });

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    /*
    |--------------------------------------------------------------------------
    | Cargar tipos
    |--------------------------------------------------------------------------
    */

    const cargarTipos = async () => {

        setCargando(true);
        setError('');

        try {

            const respuesta = await api.get('/tipos-negocio');

            setTipos(
                respuesta.data.tipos_negocio || []
            );

        } catch (error) {

            console.error(
                'Error cargando tipos de negocio:',
                error
            );

            setError(
                error.response?.data?.message ||
                'No fue posible cargar los tipos de negocio.'
            );

        } finally {

            setCargando(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Cargar al entrar
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        cargarTipos();

    }, []);


    /*
    |--------------------------------------------------------------------------
    | Abrir modal para crear
    |--------------------------------------------------------------------------
    */

    const abrirCrear = () => {

        setTipoEditando(null);

        setFormulario({
            nombre: '',
            descripcion: '',
        });

        setMensaje('');
        setError('');

        setModalAbierto(true);
    };


    /*
    |--------------------------------------------------------------------------
    | Abrir modal para editar
    |--------------------------------------------------------------------------
    */

    const abrirEditar = (tipo) => {

        setTipoEditando(tipo);

        setFormulario({
            nombre: tipo.nombre || '',
            descripcion: tipo.descripcion || '',
        });

        setMensaje('');
        setError('');

        setModalAbierto(true);
    };


    /*
    |--------------------------------------------------------------------------
    | Cerrar modal
    |--------------------------------------------------------------------------
    */

    const cerrarModal = () => {

        if (guardando) {
            return;
        }

        setModalAbierto(false);
        setTipoEditando(null);

        setFormulario({
            nombre: '',
            descripcion: '',
        });
    };


    /*
    |--------------------------------------------------------------------------
    | Cambiar formulario
    |--------------------------------------------------------------------------
    */

    const cambiarCampo = (e) => {

        const {
            name,
            value,
        } = e.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value,
        }));

        setError('');
        setMensaje('');
    };


    /*
    |--------------------------------------------------------------------------
    | Guardar
    |--------------------------------------------------------------------------
    */

    const guardar = async (e) => {

        e.preventDefault();

        setGuardando(true);
        setError('');
        setMensaje('');

        try {

            let respuesta;

            if (tipoEditando) {

                respuesta = await api.put(
                    `/tipos-negocio/${tipoEditando.id}`,
                    {
                        nombre: formulario.nombre,
                        descripcion: formulario.descripcion,
                    }
                );

            } else {

                respuesta = await api.post(
                    '/tipos-negocio',
                    {
                        nombre: formulario.nombre,
                        descripcion: formulario.descripcion,
                    }
                );

            }

            setMensaje(
                respuesta.data.message ||
                'Operación realizada correctamente.'
            );

            await cargarTipos();

            cerrarModal();

        } catch (error) {

            console.error(
                'Error guardando tipo de negocio:',
                error
            );

            if (error.response?.status === 422) {

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
                        'Revisa los datos ingresados.'
                    );

                }

            } else {

                setError(
                    error.response?.data?.message ||
                    'No fue posible guardar el tipo de negocio.'
                );

            }

        } finally {

            setGuardando(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Cambiar estado
    |--------------------------------------------------------------------------
    */

    const cambiarEstado = async (tipo) => {

        const accion = tipo.activo
            ? 'desactivar'
            : 'activar';

        const confirmar = window.confirm(
            `¿Seguro que deseas ${accion} "${tipo.nombre}"?`
        );

        if (!confirmar) {
            return;
        }

        setError('');
        setMensaje('');

        try {

            const respuesta = await api.patch(
                `/tipos-negocio/${tipo.id}/estado`
            );

            setMensaje(
                respuesta.data.message ||
                'Estado actualizado correctamente.'
            );

            await cargarTipos();

        } catch (error) {

            console.error(
                'Error cambiando estado:',
                error
            );

            setError(
                error.response?.data?.message ||
                'No fue posible cambiar el estado.'
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Estado de carga
    |--------------------------------------------------------------------------
    */

    if (cargando) {

        return (
            <div className="tipos-negocio-page">

                <div className="tipos-negocio-header">

                    <div>
                        <h1>Tipos de negocio</h1>

                        <p>
                            Administra los tipos de negocio disponibles en GENISYS.
                        </p>
                    </div>

                </div>

                <div className="tipos-negocio-card">

                    <div className="tipos-negocio-loading">
                        Cargando tipos de negocio...
                    </div>

                </div>

            </div>
        );
    }


    return (

        <div className="tipos-negocio-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="tipos-negocio-header">

                <div>

                    <h1>
                        Tipos de negocio
                    </h1>

                    <p>
                        Administra las categorías de negocio disponibles
                        para las empresas de GENISYS.
                    </p>

                </div>


                <button
                    type="button"
                    className="tipos-negocio-primary-button"
                    onClick={abrirCrear}
                >

                    <Plus size={18} />

                    Nuevo tipo

                </button>

            </div>


            {/* =====================================================
                MENSAJES
            ===================================================== */}

            {mensaje && (

                <div className="tipos-negocio-success">
                    {mensaje}
                </div>

            )}


            {error && !modalAbierto && (

                <div className="tipos-negocio-error">
                    {error}
                </div>

            )}


            {/* =====================================================
                LISTADO
            ===================================================== */}

            <div className="tipos-negocio-card">

                <div className="tipos-negocio-card-header">

                    <div className="tipos-negocio-card-icon">

                        <Store size={20} />

                    </div>

                    <div>

                        <h2>
                            Catálogo de tipos
                        </h2>

                        <p>
                            Estos tipos estarán disponibles para asignarlos
                            a las empresas.
                        </p>

                    </div>

                </div>


                {tipos.length === 0 ? (

                    <div className="tipos-negocio-empty">

                        <Store size={38} />

                        <h3>
                            No hay tipos de negocio
                        </h3>

                        <p>
                            Crea el primer tipo para comenzar.
                        </p>

                    </div>

                ) : (

                    <div className="tipos-negocio-table-wrapper">

                        <table className="tipos-negocio-table">

                            <thead>

                                <tr>

                                    <th>
                                        Tipo de negocio
                                    </th>

                                    <th>
                                        Descripción
                                    </th>

                                    <th>
                                        Estado
                                    </th>

                                    <th>
                                        Acciones
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {tipos.map((tipo) => (

                                    <tr key={tipo.id}>

                                        <td>

                                            <div className="tipo-negocio-nombre">

                                                <div className="tipo-negocio-icon">

                                                    <Store size={17} />

                                                </div>

                                                <strong>
                                                    {tipo.nombre}
                                                </strong>

                                            </div>

                                        </td>


                                        <td>

                                            <span className="tipo-negocio-descripcion">

                                                {tipo.descripcion ||
                                                    'Sin descripción'}

                                            </span>

                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    tipo.activo
                                                        ? 'tipo-estado activo'
                                                        : 'tipo-estado inactivo'
                                                }
                                            >

                                                {tipo.activo
                                                    ? 'Activo'
                                                    : 'Inactivo'}

                                            </span>

                                        </td>


                                        <td>

                                            <div className="tipo-negocio-acciones">

                                                <button
                                                    type="button"
                                                    className="tipo-accion editar"
                                                    onClick={() =>
                                                        abrirEditar(tipo)
                                                    }
                                                    title="Editar"
                                                >

                                                    <Pencil size={16} />

                                                </button>


                                                <button
                                                    type="button"
                                                    className={
                                                        tipo.activo
                                                            ? 'tipo-accion desactivar'
                                                            : 'tipo-accion activar'
                                                    }
                                                    onClick={() =>
                                                        cambiarEstado(tipo)
                                                    }
                                                    title={
                                                        tipo.activo
                                                            ? 'Desactivar'
                                                            : 'Activar'
                                                    }
                                                >

                                                    <Power size={16} />

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =====================================================
                MODAL
            ===================================================== */}

            {modalAbierto && (

                <div
                    className="tipos-negocio-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target === e.currentTarget &&
                            !guardando
                        ) {
                            cerrarModal();
                        }

                    }}
                >

                    <div className="tipos-negocio-modal">

                        <div className="tipos-negocio-modal-header">

                            <div>

                                <h2>

                                    {tipoEditando
                                        ? 'Editar tipo de negocio'
                                        : 'Nuevo tipo de negocio'}

                                </h2>

                                <p>
                                    {tipoEditando
                                        ? 'Actualiza la información del tipo.'
                                        : 'Agrega un nuevo tipo al catálogo.'}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="tipos-negocio-modal-close"
                                onClick={cerrarModal}
                                disabled={guardando}
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {error && (

                            <div className="tipos-negocio-error modal-error">
                                {error}
                            </div>

                        )}


                        <form onSubmit={guardar}>

                            <div className="tipos-negocio-modal-body">

                                <div className="tipos-negocio-field">

                                    <label htmlFor="nombre">
                                        Nombre
                                    </label>

                                    <input
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        value={formulario.nombre}
                                        onChange={cambiarCampo}
                                        placeholder="Ej. Tienda de ropa"
                                        maxLength={100}
                                        required
                                        autoFocus
                                    />

                                </div>


                                <div className="tipos-negocio-field">

                                    <label htmlFor="descripcion">
                                        Descripción
                                    </label>

                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        value={formulario.descripcion}
                                        onChange={cambiarCampo}
                                        placeholder="Descripción del tipo de negocio"
                                        maxLength={255}
                                        rows={4}
                                    />

                                </div>

                            </div>


                            <div className="tipos-negocio-modal-actions">

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
                                        : tipoEditando
                                            ? 'Guardar cambios'
                                            : 'Crear tipo'}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default TiposNegocio;