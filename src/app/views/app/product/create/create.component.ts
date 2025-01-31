import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Products } from '../product.interface';
import { getCompanyId, getPermision } from '../../../../utils/util';
import { ApiService } from '../../../../data/api.service';
import { BalanceService } from '../../../../data/balance.service';
import { AuthService } from '../../../../shared/auth.service';
import { Brands } from '../../brands/brands.interface';
import { Categorys } from '../../categorys/categorys.interface';
import { Subcategorys } from '../../subcategorys/subcategorys.interface';
import { Suppliers } from '../../supplier/supplier.interface';
import Swal from 'sweetalert2';
import { Options } from '../../../../components/select-default/select-default.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { StyleRenderer } from '@alyle/ui';
import { STYLES } from '../../../../app.component';
import { LyIconService } from '@alyle/ui/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadService } from '../../../../shared/load.service';

declare var $: any;

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  providers: [
    StyleRenderer
  ]
})
export class CreateComponent {
  readonly classes = this.sRenderer.renderSheet(STYLES, true);

  form!: FormGroup;
  isEditMode = false;
  productSelected?: Products;
  data: Products[] = [];

  brandsSelect: Options[] = []
  categorySelect: Options[] = []
  subcategorySelect: Options[] = []
  supplierSelect: Options[] = []
  controlStock = [
    { label: 'Sim', value: 'S' },
    { label: 'Não', value: 'N' }
  ]

  permissions = getPermision()
  disableNew = false;

  images: string[] = [];

  constructor(
    readonly sRenderer: StyleRenderer,
    iconService: LyIconService,
    sanitizer: DomSanitizer,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private routeParam: ActivatedRoute,
    private loaderService: LoadService
  ) {
    this.form = this.formBuilder.group({
      description: ['', [Validators.required]],
      price_sale: ['', [Validators.required]],
      price_cost: ['', [Validators.required]],
      ncm: [''],
      control_stock: ['S'],
      stock: [''],
      stock_minimum: [''],
      id_brand: [''],
      id_category: [''],
      id_subcategory: [''],
      id_fornecedor: [''],
    })

    this.routeParam.paramMap.subscribe(params => {
      let id = params.get('id')
      if (id) {
        this.isEditMode = true;
        this.apiService.findProducts({
          filter: {
            id: Number(id),
            id_company: getCompanyId()
          }
        }).then(res => {
          if (res.results.length) {
            this.update(res.results[0])
          }
        })
      }
    });

    this.loadProductsPermissions();

    iconService.setSvg('Github', sanitizer.bypassSecurityTrustResourceUrl('assets/svg/github'));
    iconService.setSvg('Theme', sanitizer.bypassSecurityTrustResourceUrl('assets/svg/round-format_color_fill-24px'));
    iconService.setSvg('Discord', sanitizer.bypassSecurityTrustResourceUrl('assets/svg/discord'));
  }

  ngOnInit() {
    this.load();
  }

  async load() {
    const [brands, category, subcategory, supplier] = await Promise.all([
      this.apiService.findBrands({
        filter: {
          deleted: 'N',
          id_company: getCompanyId()
        }
      }),
      this.apiService.findCategorys({
        filter: {
          deleted: 'N',
          id_company: getCompanyId()
        }
      }),
      this.apiService.findSubcategorys({
        filter: {
          deleted: 'N',
          id_company: getCompanyId()
        }
      }),
      this.apiService.findSuppliers({
        filter: {
          deleted: 'N',
          id_company: getCompanyId()
        }
      })
    ]);

    this.brandsSelect = brands.results.map((brand: Brands): Options => { return { label: brand.description, value: brand.id || 0 } })
    this.categorySelect = category.results.map((category: Categorys): Options => { return { label: category.description, value: category.id || 0 } })
    this.subcategorySelect = subcategory.results.map((subcategorys: Subcategorys): Options => { return { label: subcategorys.description, value: subcategorys.id || 0 } })
    this.supplierSelect = supplier.results.map((supplier: Suppliers): Options => { return { label: supplier.name || '', value: supplier.id || 0 } })
  }

  loadProductsPermissions() {
    this.apiService.findProducts({
      filter: {
        deleted: 'N',
        id_company: getCompanyId()
      }
    }).then(res => {
      if (this.permissions?.limite_produtos) {
        this.disableNew = this.permissions?.limite_produtos <= res.results.length ? true : false;
      }
    });
  }

  save() {
    this.loaderService.show();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    let values = this.form.value;

    if (values.price_sale) {
      values.price_sale = values.price_sale.replace('R$', '').replace('.', '').replace(',', '.').trim() || 0;
    }

    if (values.price_cost) {
      values.price_cost = values.price_cost.replace('R$', '').replace('.', '').replace(',', '.').trim() || 0;
    }

    values.id_brand = values.id_brand || null;
    values.id_category = values.id_category || null;
    values.id_subcategory = values.id_subcategory || null;
    values.id_fornecedor = values.id_fornecedor || null;

    if (this.isEditMode) {
      Swal.fire({
        title: 'Deseja salvar as alterações?',
        showCancelButton: true,
        confirmButtonText: `Salvar`,
        cancelButtonText: `Cancelar`,
      }).then((result) => {
        if (result.isConfirmed) {
          this.apiService.updateProduct({
            id: this.productSelected?.id,
            ...values,
            images: this.images,
            id_company: getCompanyId(),
            deleted: this.productSelected?.deleted
          }).then(res => {
            this.loaderService.hide();
            Swal.fire("Produto alterado com sucesso", "", "success").then(() => {
              this.router.navigate(['/app/product']);
            });
          }).catch(err => {
            Swal.fire("Erro ao salvar", "", "error");
            this.loaderService.hide();
          })
        }
      })
    } else {
      Swal.fire({
        title: 'Deseja salvar este produto?',
        showCancelButton: true,
        confirmButtonText: `Salvar`,
        cancelButtonText: `Cancelar`,
      }).then((result) => {
        if (result.isConfirmed) {
          this.apiService.createProduct({
            ...values,
            images: this.images,
            id_company: getCompanyId(),
          }).then(res => {
            this.loaderService.hide();
            Swal.fire("Produto salvo com sucesso", "", "success").then(() => {
              this.router.navigate(['/app/product']);
            });
          }).catch(err => {
            Swal.fire("Erro ao salvar", "", "error");
            this.loaderService.hide();
          })
        }
      })
    }
  }

  update(product: Products) {
    this.productSelected = product;
    this.form.get('description')?.setValue(product.description ? product.description : '');
    this.form.get('id_brand')?.setValue(product.id_brand ? String(product.id_brand) : '');
    this.form.get('id_category')?.setValue(product.id_category ? String(product.id_category) : '');
    this.form.get('id_subcategory')?.setValue(product.id_subcategory ? String(product.id_subcategory) : '');
    this.form.get('price_sale')?.setValue(product.price_sale ? this.formatValueCurrency(product.price_sale) : '');
    this.form.get('price_cost')?.setValue(product.price_cost ? this.formatValueCurrency(product.price_cost) : '');
    this.form.get('ncm')?.setValue(product.ncm ? product.ncm : '');
    this.form.get('id_fornecedor')?.setValue(product.id_fornecedor ? String(product.id_fornecedor) : '');
    this.form.get('control_stock')?.setValue(product.control_stock ? product.control_stock : 'S');
    this.form.get('stock')?.setValue(product.stock ? String(product.stock) : '');
    this.form.get('stock_minimum')?.setValue(product.stock_minimum ? String(product.stock_minimum) : '');
    this.images = product.images?.map((image) => image.image) || [];
    this.isEditMode = true;
    $('#modalProduct').modal('show');
  }

  formatValueCurrency(value: string | number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  }

  changeValueFormat(control: AbstractControl) {
    let value: any = control.value;

    if (value) {
      value = value.replace(/[^0-9]/g, '')
      value = value.replace('.', '').replace(',', '.');
      value = Number(value) / 100;
      value = this.formatValueCurrency(value);
      control.setValue(value);
    }
  }

  getImages = (imagesBase: string[]) => {
    this.images = imagesBase;
  }
}
