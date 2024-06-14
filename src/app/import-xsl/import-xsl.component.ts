import { async } from '@angular/core/testing';


import { FileService } from '../services/file.service';
import { Component, OnInit, HostBinding } from '@angular/core';
import { Solicitud, FileRes, Usuario, EnumLotes, LotesParams, Lotes, LotesFilterOptions, Provincias } from 'src/app/models/Model';
import { FileItem, FileLikeObject, FileSelectDirective, FileUploader} from 'ng2-file-upload'
import {saveAs} from 'file-saver';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GlobalVariable } from '../global';
import Swal from 'sweetalert2';
import { NgxImageCompressService } from 'ngx-image-compress';

const uri = GlobalVariable.BASE_API_URL + "/file/importxls"

@Component({
  selector: 'app-import-xsl',
  templateUrl: './import-xsl.component.html',
  styleUrls: ['./import-xsl.component.css']
})

export class ImportXslComponent implements OnInit {

  uploader:FileUploader = new FileUploader({url:uri});
  nombre_archivo:string = "";

  constructor(
    private fileService: FileService,
    private route: ActivatedRoute,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private imageCompress: NgxImageCompressService) {


  this.uploader.onBeforeUploadItem = (item: FileItem) => {

    item.withCredentials = false;   

    item.file.name= sessionStorage.getItem('nombre') as unknown as string + "-";
    }

    this.uploader.onCompleteItem=(item:any, response:any,status:any, headers:any) =>{

    }

    this.uploader.onProgressItem=(fileItem:any, progress:any) =>{

    }

  }

    ngOnInit(): void {
    }

}

