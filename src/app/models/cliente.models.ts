export interface Cliente {
    nombre: string;
    apellido: string;
    dni?: string | null;
    email: string;
    telefono: string;
    direccion: string;
    pais: string;
    codigoPostal: string;
    fechaRegistro: Date;
    fechaNacimiento?: Date | null;
    genero: 'M' | 'F';
    activo: boolean;

}
