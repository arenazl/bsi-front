import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FileService } from './file.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    private fileService: FileService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Agregar token si existe
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        return this.fileService.refreshToken(refreshToken).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            
            if (response.accessToken) {
              localStorage.setItem('accessToken', response.accessToken);
              this.refreshTokenSubject.next(response.accessToken);
              return next.handle(this.addToken(request, response.accessToken));
            }
            
            // Si no hay token válido, redirigir al login
            this.router.navigate(['/login']);
            return throwError('No se pudo refrescar el token');
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.router.navigate(['/login']);
            return throwError(err);
          })
        );
      } else {
        // No hay refresh token, redirigir al login
        this.router.navigate(['/login']);
        return throwError('No hay refresh token');
      }
    } else {
      // Si ya estamos refrescando, esperar al nuevo token
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}