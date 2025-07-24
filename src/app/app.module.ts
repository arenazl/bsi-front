
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

// App modules and routing
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Feature modules
import { AdminModule } from './components/admin/admin.module';
import { BsiModule } from './components/bsi/bsi.module';
import { LegacyModule } from './components/legacy/legacy.module';
import { TestModule } from './components/test/test.module';
import { SharedModule } from './shared/shared.module';

// Services and interceptors
import { AuthInterceptor } from './services/auth.interceptor';
import { LegajoService } from './services/legajo.service';
import { NgxImageCompressService } from 'ngx-image-compress';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    // Feature modules
    SharedModule,
    AdminModule,
    BsiModule,
    LegacyModule,
    TestModule
  ],
  providers: [
    DatePipe,
    LegajoService,
    NgxImageCompressService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
  
})
export class AppModule { }
