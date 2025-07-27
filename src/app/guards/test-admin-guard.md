# Cómo Validar el AdminGuard

## 1. Verificar en la Consola del Navegador

Cuando intentes acceder a `/admin`, vas a ver estos mensajes:

```javascript
AdminGuard - Usuario autenticado: true/false
AdminGuard - Es super usuario: true/false
AdminGuard - Datos del usuario: {objeto usuario}
```

## 2. Casos de Prueba

### CASO 1: Usuario NO logueado
1. Cerrá sesión (logout)
2. Intentá ir directo a: `http://localhost:4200/admin`
3. **Resultado esperado**: Te redirige a `/login`

### CASO 2: Usuario normal (NO super admin)
1. Logueate con un usuario común
2. Intentá acceder al admin desde el menú o directo
3. **Resultado esperado**: 
   - Muestra popup "Acceso Denegado"
   - Te redirige a `/mainMenu`

### CASO 3: Usuario admin
1. Logueate con usuario "admin" 
2. Accedé al panel admin
3. **Resultado esperado**: Acceso permitido ✅

## 3. Verificar en el Código

```typescript
// En el login, agregá este console.log temporal:
console.log('Usuario logueado:', {
  nombre: res.datos.Nombre,
  isSuperUser: res.datos.isSuperUser || (res.datos.Nombre?.toLowerCase() === 'admin')
});
```

## 4. Simular Diferentes Escenarios

### Forzar usuario como super admin (temporal para testing):
```typescript
// En login.component.ts después del login exitoso:
this.userSessionService.setSession({
  ...res.datos,
  isSuperUser: true  // Forzar para testing
});
```

### Forzar usuario como NO admin:
```typescript
this.userSessionService.setSession({
  ...res.datos,
  isSuperUser: false  // Forzar para testing
});
```

## 5. Verificar el Estado en SessionStorage

Abrí DevTools → Application → Session Storage:

- Buscá la key `isSuperUser`
- Debería decir `true` o `false`

## 6. Test Rápido por Consola

Pegá esto en la consola del navegador:

```javascript
// Ver si estás autenticado
sessionStorage.getItem('Nombre')

// Ver si sos super usuario
sessionStorage.getItem('isSuperUser')

// Forzar super usuario (solo para test)
sessionStorage.setItem('isSuperUser', 'true')
location.reload()
```