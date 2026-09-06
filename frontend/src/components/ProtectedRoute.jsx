import {
    Navigate,
    Outlet,
} from 'react-router-dom';

function ProtectedRoute({
    children,
    funcionalidad = null,
    permiso = null,
}) {
    const token = localStorage.getItem('token');

    const usuario = JSON.parse(
        localStorage.getItem('usuario')
    );

    /*
    |--------------------------------------------------------------------------
    | SESIÓN
    |--------------------------------------------------------------------------
    */

    if (!token || !usuario) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    /*
    |--------------------------------------------------------------------------
    | FUNCIONALIDAD
    |--------------------------------------------------------------------------
    */

    const funcionalidades =
        usuario.funcionalidades ?? [];

    const tieneFuncionalidad =
        !funcionalidad ||
        funcionalidades.some(
            (item) =>
                item.codigo === funcionalidad
        );

    /*
    |--------------------------------------------------------------------------
    | PERMISO
    |--------------------------------------------------------------------------
    */

    const permisos =
        usuario.permisos ?? [];

    const tienePermiso =
        !permiso ||
        permisos.includes(permiso);

    /*
    |--------------------------------------------------------------------------
    | AUTORIZACIÓN
    |--------------------------------------------------------------------------
    */

    if (
        !tieneFuncionalidad ||
        !tienePermiso
    ) {
        return (
            <Navigate
                to="/acceso-denegado"
                replace
            />
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CONTENIDO
    |--------------------------------------------------------------------------
    */

    if (children) {
        return children;
    }

    return <Outlet />;
}

export default ProtectedRoute;