export function tienePermiso(nombrePermiso) {
    try {
        const usuario = JSON.parse(
            localStorage.getItem('usuario')
        );

        if (!usuario || !Array.isArray(usuario.permisos)) {
            return false;
        }

        return usuario.permisos.includes(nombrePermiso);
    } catch (error) {
        console.error(
            'Error al comprobar permisos:',
            error
        );

        return false;
    }
}

export function tieneAlgunPermiso(permisos) {
    return permisos.some((permiso) =>
        tienePermiso(permiso)
    );
}

export function tieneTodosLosPermisos(permisos) {
    return permisos.every((permiso) =>
        tienePermiso(permiso)
    );
}