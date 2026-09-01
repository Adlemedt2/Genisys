import { useEffect, useState } from 'react';

import {
    Building2,
    FileText,
    Phone,
    MapPin,
    Store,
    Save,
} from 'lucide-react';

import api from '../services/api';


function Configuracion() {

    const [formulario, setFormulario] = useState({
        nombre: '',
        nit: '',
        telefono: '',
        direccion: '',
        tipo_negocio_id: '',
    });


    const [tiposNegocio, setTiposNegocio] = useState([]);

    const [cargando, setCargando] = useState(true);

    const [guardando, setGuardando] = useState(false);

    const [mensaje, setMensaje] = useState('');

    const [error, setError] = useState('');


    /*
    |--------------------------------------------------------------------------
    | Cargar configuración
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const cargarDatos = async () => {

            setCargando(true);

            setError('');

            try {

                const [respuestaEmpresa, respuestaTipos] =
                    await Promise.allSettled([
                        api.get('/empresa'),
                        api.get('/tipos-negocio'),
                    ]);


                /*
                |--------------------------------------------------------------------------
                | Tipos de negocio
                |--------------------------------------------------------------------------
                */

                if (
                    respuestaTipos.status === 'fulfilled'
                ) {

                    setTiposNegocio(
                        respuestaTipos.value.data.tipos_negocio || []
                    );

                } else {

                    throw new Error(
                        'No fue posible cargar los tipos de negocio.'
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | Empresa
                |--------------------------------------------------------------------------
                */

                if (
                    respuestaEmpresa.status === 'fulfilled'
                ) {

                    const empresa =
                        respuestaEmpresa.value.data.empresa;

                    setFormulario({
                        nombre: empresa.nombre || '',
                        nit: empresa.nit || '',
                        telefono: empresa.telefono || '',
                        direccion: empresa.direccion || '',
                        tipo_negocio_id:
                            empresa.tipo_negocio_id
                                ? String(empresa.tipo_negocio_id)
                                : '',
                    });

                } else {

                    /*
                    |--------------------------------------------------------------------------
                    | 404 significa que todavía no existe empresa
                    |--------------------------------------------------------------------------
                    */

                    if (
                        respuestaEmpresa.reason?.response?.status !== 404
                    ) {

                        throw new Error(
                            'No fue posible cargar la configuración de la empresa.'
                        );

                    }

                }

            } catch (error) {

                console.error(
                    'Error cargando configuración:',
                    error
                );

                setError(
                    error.response?.data?.message ||
                    error.message ||
                    'No fue posible cargar la configuración.'
                );

            } finally {

                setCargando(false);

            }
        };


        cargarDatos();

    }, []);


    /*
    |--------------------------------------------------------------------------
    | Cambiar campo
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


        setMensaje('');

        setError('');

    };


    /*
    |--------------------------------------------------------------------------
    | Guardar
    |--------------------------------------------------------------------------
    */

    const guardar = async (e) => {

        e.preventDefault();

        setGuardando(true);

        setMensaje('');

        setError('');


        try {

            const respuesta = await api.post(
                '/empresa',
                {
                    nombre: formulario.nombre,
                    nit: formulario.nit,
                    telefono: formulario.telefono,
                    direccion: formulario.direccion,
                    tipo_negocio_id:
                        Number(formulario.tipo_negocio_id),
                }
            );


            const empresa =
                respuesta.data.empresa;


            /*
            |--------------------------------------------------------------------------
            | Actualizar formulario con respuesta del backend
            |--------------------------------------------------------------------------
            */

            setFormulario({
                nombre: empresa.nombre || '',
                nit: empresa.nit || '',
                telefono: empresa.telefono || '',
                direccion: empresa.direccion || '',
                tipo_negocio_id:
                    empresa.tipo_negocio_id
                        ? String(empresa.tipo_negocio_id)
                        : '',
            });


            setMensaje(
                respuesta.data.message ||
                'Configuración guardada correctamente.'
            );

        } catch (error) {

            console.error(
                'Error guardando configuración:',
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
                    'No fue posible guardar la configuración.'
                );

            }

        } finally {

            setGuardando(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | Estado de carga
    |--------------------------------------------------------------------------
    */

    if (cargando) {

        return (
            <div className="config-page">

                <div className="config-header">

                    <div>

                        <h1>
                            Configuración de empresa
                        </h1>

                        <p>
                            Cargando información de tu negocio...
                        </p>

                    </div>

                </div>


                <div className="config-card">

                    <div className="config-loading">
                        Cargando configuración...
                    </div>

                </div>

            </div>
        );

    }


    return (

        <div className="config-page">


            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="config-header">

                <div>

                    <h1>
                        Configuración de empresa
                    </h1>

                    <p>
                        Administra la información general de tu negocio.
                    </p>

                </div>

            </div>


            {/* =====================================================
                MENSAJES
            ===================================================== */}

            {mensaje && (

                <div className="config-success">
                    {mensaje}
                </div>

            )}


            {error && (

                <div className="config-error">
                    {error}
                </div>

            )}


            {/* =====================================================
                FORMULARIO
            ===================================================== */}

            <form onSubmit={guardar}>

                <div className="config-card">


                    {/* =================================================
                        HEADER CARD
                    ================================================= */}

                    <div className="config-card-header">

                        <div className="config-card-icon">

                            <Building2 size={20} />

                        </div>


                        <div>

                            <h2>
                                Información general
                            </h2>

                            <p>
                                Estos datos identifican tu empresa dentro de GENISYS.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        CAMPOS
                    ================================================= */}

                    <div className="config-form-grid">


                        {/* NOMBRE */}

                        <div className="config-field">

                            <label htmlFor="nombre">
                                Nombre de la empresa
                            </label>


                            <div className="config-input-wrapper">

                                <Building2 size={18} />

                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    value={formulario.nombre}
                                    onChange={cambiarCampo}
                                    placeholder="Ej. Ferretería El Constructor"
                                    maxLength={150}
                                    required
                                />

                            </div>

                        </div>


                        {/* NIT */}

                        <div className="config-field">

                            <label htmlFor="nit">
                                NIT
                            </label>


                            <div className="config-input-wrapper">

                                <FileText size={18} />

                                <input
                                    id="nit"
                                    name="nit"
                                    type="text"
                                    value={formulario.nit}
                                    onChange={cambiarCampo}
                                    placeholder="Ej. 900123456"
                                    maxLength={30}
                                />

                            </div>

                        </div>


                        {/* TELEFONO */}

                        <div className="config-field">

                            <label htmlFor="telefono">
                                Teléfono
                            </label>


                            <div className="config-input-wrapper">

                                <Phone size={18} />

                                <input
                                    id="telefono"
                                    name="telefono"
                                    type="text"
                                    value={formulario.telefono}
                                    onChange={cambiarCampo}
                                    placeholder="Ej. 3001234567"
                                    maxLength={30}
                                />

                            </div>

                        </div>


                        {/* TIPO DE NEGOCIO */}

                        <div className="config-field">

                            <label htmlFor="tipo_negocio_id">
                                Tipo de negocio
                            </label>


                            <div className="config-input-wrapper">

                                <Store size={18} />


                                <select
                                    id="tipo_negocio_id"
                                    name="tipo_negocio_id"
                                    value={formulario.tipo_negocio_id}
                                    onChange={cambiarCampo}
                                    required
                                >

                                    <option value="">
                                        Selecciona un tipo de negocio
                                    </option>


                                    {tiposNegocio.map((tipo) => (

                                        <option
                                            key={tipo.id}
                                            value={tipo.id}
                                        >
                                            {tipo.nombre}
                                        </option>

                                    ))}

                                </select>

                            </div>

                        </div>


                        {/* DIRECCIÓN */}

                        <div className="config-field config-field-full">

                            <label htmlFor="direccion">
                                Dirección
                            </label>


                            <div className="config-input-wrapper">

                                <MapPin size={18} />

                                <input
                                    id="direccion"
                                    name="direccion"
                                    type="text"
                                    value={formulario.direccion}
                                    onChange={cambiarCampo}
                                    placeholder="Dirección del negocio"
                                    maxLength={250}
                                />

                            </div>

                        </div>


                    </div>


                    {/* =================================================
                        INFORMACIÓN
                    ================================================= */}

                    <div className="config-info">

                        <Store size={18} />

                        <div>

                            <strong>
                                Configuración del negocio
                            </strong>

                            <p>
                                El tipo de negocio permitirá que GENISYS
                                adapte posteriormente sus catálogos y módulos.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        ACCIONES
                    ================================================= */}

                    <div className="config-actions">

                        <button
                            type="submit"
                            className="config-save-button"
                            disabled={guardando}
                        >

                            <Save size={18} />

                            {guardando
                                ? 'Guardando...'
                                : 'Guardar cambios'
                            }

                        </button>

                    </div>

                </div>

            </form>

        </div>

    );
}


export default Configuracion;