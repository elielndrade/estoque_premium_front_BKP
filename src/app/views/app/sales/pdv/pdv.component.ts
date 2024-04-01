import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as bootstrap from 'bootstrap';

import { Options } from '../../../../components/select-default/select-default.interface';
import { ApiService } from '../../../../data/api.service';
import { Products } from '../../product/product.interface';
import { SalesService } from '../../../../data/sales.service';
import { SaleProduct, Sales } from '../sales.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { getCompanyId, getUserId } from '../../../../utils/util';

import Swal from 'sweetalert2';
import { Brands } from '../../brands/brands.interface';
import { Categorys } from '../../categorys/categorys.interface';
import { Subcategorys } from '../../subcategorys/subcategorys.interface';
import { Suppliers } from '../../supplier/supplier.interface';
import { Clients } from '../../client/client.interface';
import { BalanceService } from '../../../../data/balance.service';

declare var $: any;

interface PaymentForms {
  id: number;
  label: 'DINHEIRO' | 'CARTÃO DE DÉBITO' | 'CARTÃO DE CRÉDITO' | 'PIX';
  value: number;
  icon: 'far fa-credit-card' | 'far fa-money-bill-alt' | 'far fa-credit-card' | 'fas fa-qrcode';
  class: 'bg-success' | 'bg-primary' | 'bg-secondary' | 'bg-danger';
}

@Component({
  selector: 'app-pdv',
  templateUrl: './pdv.component.html',
  styleUrl: './pdv.component.scss'
})
export class PdvComponent {
  valueBox = new FormControl('0');

  isEdit = false;
  currentSale!: Sales;
  currentProduct!: Products;
  search = new FormControl('');

  description = new FormControl('');
  price_sale = new FormControl('');
  price_cost = new FormControl('');
  ncm = new FormControl('');
  control_stock = new FormControl('S');
  stock = new FormControl('');
  id_company = new FormControl('');
  id_brand = new FormControl('');
  id_category = new FormControl('');
  id_subcategory = new FormControl('');
  id_supplier = new FormControl('');

  id_client = new FormControl(0);

  clientsSelect: Options[] = [];
  brandsSelect: Options[] = [];
  categorySelect: Options[] = [];
  subcategorySelect: Options[] = [];
  supplierSelect: Options[] = [];
  controlStock = [
    { label: 'Sim', value: 'S' },
    { label: 'Não', value: 'N' }
  ];

  quantity = new FormControl(1);
  desconto = new FormControl('R$ 0,00');
  desconto_percentual = new FormControl(0);
  total_value = new FormControl('0');
  value = new FormControl('0');
  value_sale = new FormControl('0');
  paymentValue = new FormControl();

  products: Products[] = [];

  total = 0;
  totalPayment = 0;
  troco = 0;

  paymentSelected!: | 1 | 2 | 3 | 4;
  paymentForms: PaymentForms[] = [];

  constructor(
    private apiService: ApiService,
    private salesService: SalesService,
    private router: Router,
    private routeParam: ActivatedRoute,
    private balanceService: BalanceService
  ) {
    this.routeParam.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      this.isEdit = !!id;
      this.load(Number(id));
    });
  }

  ngOnInit(): void {
    this.load();

    this.apiService.findBox({
      filter: {
        id_company: getCompanyId(),
        id_user: getUserId(),
        status: 'AB'
      }
    }).then(res => {
    }).catch(() => {
      const element = document.getElementById('modalOpenBox');

      if (element) {
        var myModal = new bootstrap.Modal(element, {
          backdrop: 'static'
        });
        myModal.show();
      }
    })
  }

  loadProducts(event: KeyboardEvent) {
    if (event.key.toLocaleUpperCase() === 'ENTER') {
      this.apiService.findProducts({
        filter: {
          deleted: "N",
          id_company: getCompanyId()
        },
        search: this.search.value || ''
      }).then(response => {
        this.products = response.results;
        this.openModal();
      });
    };
  }

  openModal = () => {
    const element = document.getElementById('modalListProduct');

    if (element) {
      var myModal = new bootstrap.Modal(element, {});
      myModal.show();
    }
  }

  openModalAddProduct = () => {
    const element = document.getElementById('modalAddProduct');

    if (element) {
      var myModal = new bootstrap.Modal(element, {});
      myModal.show();
    }
  }

  openModalPayment = () => {
    const element = document.getElementById('modalPayment');

    if (element) {
      var myModal = new bootstrap.Modal(element, {});
      myModal.show();
    }
  }

  openModalPaymentValue = (payment: 1 | 2 | 3 | 4) => {
    this.closeModal();

    setTimeout(() => {
      this.paymentSelected = payment;

      const element = document.getElementById('modalValorVenda');

      if (element) {
        var myModal = new bootstrap.Modal(element, {});
        myModal.show();
      }
    }, 500)
  }

  closeModal = () => {
    let element = document.getElementById('modalListProduct');

    if (element) {
      var myModal = bootstrap.Modal.getInstance(element);
      if (myModal) {
        myModal.hide();
      }
    }

    element = document.getElementById('modalAddProduct');

    if (element) {
      var myModal = bootstrap.Modal.getInstance(element);
      if (myModal) {
        myModal.hide();
      }
    }

    element = document.getElementById('modalPayment');

    if (element) {
      var myModal = bootstrap.Modal.getInstance(element);
      if (myModal) {
        myModal.hide();
      }
    }

    element = document.getElementById('modalValorVenda');

    if (element) {
      var myModal = bootstrap.Modal.getInstance(element);
      if (myModal) {
        myModal.hide();
      }
    }
  }

  async load(id?: number) {
    this.apiService.findBrands({
      filter: {
        id_company: getCompanyId()
      }
    }).then(response => {
      this.brandsSelect = response.results.map((item: Brands) => ({ label: item.description, value: item.id }));
    });

    this.apiService.findCategorys({
      filter: {
        id_company: getCompanyId()
      }
    }).then(response => {
      this.categorySelect = response.results.map((item: Categorys) => ({ label: item.description, value: item.id }));
    });

    this.apiService.findSubcategorys({
      filter: {
        id_company: getCompanyId()
      }
    }).then(response => {
      this.subcategorySelect = response.results.map((item: Subcategorys) => ({ label: item.description, value: item.id }));
    });

    this.apiService.findSuppliers({
      filter: {
        id_company: getCompanyId()
      }
    }).then(response => {
      this.supplierSelect = response.results.map((item: Suppliers) => ({ label: item.name, value: item.id }));
    });

    this.apiService.findClient({
      filter: {
        id_company: getCompanyId()
      }
    }).then(response => {


      console.log(response.results);

      this.clientsSelect = response.results.map((item: Clients) => ({ label: item.name, value: item.id }));
      this.clientsSelect.unshift({ label: 'Consumidor Final', value: 0 });
    });

    if (id) {
      this.salesService.findSales({
        filter: {
          id: id
        }
      }).then(response => {
        if (response.results) {
          this.currentSale = response.results[0] as Sales;
          this.total = 0;
          this.currentSale.products?.forEach(product => {
            this.total += Number(product.total);
          });

          this.updateTotal();
        }
      });
    }
  }

  save() {
    this.apiService.createProduct({
      description: this.description.value ? this.description.value : '',
      id_brand: Number(this.id_brand.value) || 0,
      id_category: Number(this.id_category.value) || 0,
      id_subcategory: Number(this.id_subcategory.value) || 0,
      price_sale: Number(this.price_sale.value) || 0,
      price_cost: Number(this.price_cost.value) || 0,
      ncm: this.ncm.value ? this.ncm.value : '',
      id_fornecedor: Number(this.id_supplier.value) || 0,
      control_stock: this.control_stock.value || 'S',
      stock: Number(this.stock.value) || 0,
      id_company: 1
    }).then(() => {
      $('#modalProduct').modal('hide');
    });
  }

  saveBox() {
    this.apiService.createBox({
      id_company: getCompanyId(),
      id_user: getUserId(),
      value_init: Number(this.valueBox.value)
    }).then(() => {
      let element = document.getElementById('modalOpenBox');

      if (element) {
        var myModal = bootstrap.Modal.getInstance(element);
        if (myModal) {
          myModal.hide();
        }
      }

      this.load();
    })
  }

  createSale(callback?: () => void) {
    this.salesService.createSale({
      id_company: 1,
      id_user: 1,
      total: 0
    }).then(response => {
      this.currentSale = response.results as Sales;
      if (callback) {
        callback();
      }
    });
  }

  async addProduct(product: Products): Promise<void> {
    const response = await this.salesService.addProduct({
      id: 0,
      id_product: product.id || 0,
      id_sale: this.currentSale.id || 0,
      quantity: Number(this.quantity.value),
      desconto: Number(this.desconto.value?.replace('R$', '').replace('.', '').replace(',', '.') || 0) || 0,
      desconto_percentual: Number(this.desconto_percentual.value) || 0,
      total: Number(this.total_value.value?.replace('R$', '').replace('.', '').replace(',', '.') || 0)
    })

    if (response) {
      this.search.setValue('');
      this.closeModal();
      this.load(this.currentSale.id);
    }
  }

  verifySale(product: Products) {
    this.closeModal();
    this.quantity.setValue(1);
    this.desconto.setValue('R$ 0,00');
    this.desconto_percentual.setValue(0);
    this.total_value.setValue(this.formatValueCurrency(product.price_sale ? product.price_sale : 0));
    this.value.setValue(this.formatValueCurrency(product.price_cost || 0));
    this.value_sale.setValue(this.formatValueCurrency(product.price_sale || 0));

    this.currentProduct = product;
    this.openModalAddProduct();
  }

  changeQuantity(quantity: number) {
    let valueFormated = this.formatValue(this.value_sale.value?.replace(/[^0-9]/g, '') || 0);

    this.total_value.setValue(this.formatValueCurrency(Number(valueFormated) * quantity));
  }

  changeDiscount() {
    if (Number(this.desconto_percentual.value) <= 0) {
      this.desconto_percentual.setValue(0);
    }

    let valueDiscount = (Number(this.desconto_percentual.value) * (Number(this.currentProduct.price_sale) * Number(this.quantity.value))) / 100

    this.desconto.setValue(this.formatValueCurrency(valueDiscount))
    this.total_value.setValue(this.formatValueCurrency((Number(this.currentProduct.price_sale) * Number(this.quantity.value)) - valueDiscount))
  }

  changeDiscountValue() {
    let newValue = this.formatValue(this.desconto.value?.replace(/[^0-9]/g, '') || 0);
    if (Number(newValue) <= 0) {
      this.desconto.setValue('0');
    }

    let valueWhitDiscount = (Number(this.currentProduct.price_sale) * Number(this.quantity.value)) - Number(newValue);
    this.total_value.setValue(this.formatValueCurrency(valueWhitDiscount));
    this.desconto_percentual.setValue(Number(((Number(newValue) * 100) / (Number(this.currentProduct.price_sale) * Number(this.quantity.value))).toFixed(2)));
    this.desconto.setValue(this.formatValueCurrency(newValue));
  }

  addProductToSale() {
    if (this.currentSale) {
      this.addProduct(this.currentProduct);
    } else {
      this.createSale(() => this.addProduct(this.currentProduct).then(() => {
        this.closeModal();
        this.router.navigate(['/app/sales/pdv/' + this.currentSale.id]);
      }));
    }

    this.closeModal();
  }

  async deleteProduct(product: SaleProduct): Promise<void> {
    const response = await this.salesService.deleteProduct(product)

    if (response && this.isEdit) {
      this.load(this.currentSale.id);
    }
  }

  formatValueCurrency(value: string | number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  }

  formatValue(value: string | number) {
    return (Number(value) / 100).toFixed(2);
  }

  updateTotal() {
    this.salesService.updateSale({
      id: this.currentSale.id,
      total: this.total,
      status: 'AB'
    }).then(data => {
      console.log(data);
    })
  }

  updateClient() {
    this.salesService.updateSale({
      id: this.currentSale.id,
      total: this.total,
      id_client: Number(this.id_client.value) > 0 ? Number(this.id_client.value) : null,
      status: 'AB'
    }).then(data => {
      console.log(data);
    })
  }

  applyPayment() {
    if (this.paymentSelected !== 1 && Number(this.paymentValue.value) > (this.total - this.totalPayment)) {
      alert('O valor do pagamento não pode ser maior que o valor total da venda!');
      return;
    }

    if (this.paymentSelected === 1 && Number(this.paymentValue.value) > (this.total - this.totalPayment)) {
      this.troco = Number(this.paymentValue.value) - (this.total - this.totalPayment);
    }

    switch (this.paymentSelected) {
      case 1:
        this.paymentForms.push({
          id: 1,
          label: 'DINHEIRO',
          value: Number(this.paymentValue.value),
          icon: 'far fa-money-bill-alt',
          class: 'bg-success'
        });
        break;
      case 2:
        this.paymentForms.push({
          id: 2,
          label: 'CARTÃO DE DÉBITO',
          value: Number(this.paymentValue.value),
          icon: 'far fa-credit-card',
          class: 'bg-primary'
        });
        break;
      case 3:
        this.paymentForms.push({
          id: 3,
          label: 'CARTÃO DE CRÉDITO',
          value: Number(this.paymentValue.value),
          icon: 'far fa-credit-card',
          class: 'bg-secondary'
        });
        break;
      case 4:
        this.paymentForms.push({
          id: 4,
          label: 'PIX',
          value: Number(this.paymentValue.value),
          icon: 'fas fa-qrcode',
          class: 'bg-danger'
        });
        break;
    }

    this.totalPayment += Number(this.paymentValue.value);
    this.paymentValue.setValue('');
    this.closeModal();

    setTimeout(() => {
      this.openModalPayment();
    }, 200)
  }

  deletPaymentForm(payment: PaymentForms) {
    this.paymentForms = this.paymentForms.filter(item => item.id !== payment.id);
    this.totalPayment -= payment.value;
    this.troco = this.totalPayment - this.total;

    if (this.troco < 0) {
      this.troco = 0;
    }
  }

  finishedSale() {
    this.closeModal();
    let newSaleValue = this.currentSale;
    newSaleValue.status = 'FE';

    this.salesService.updateSale(newSaleValue).then((data) => {
      Swal.fire({
        title: 'Sucesso!',
        text: 'Venda realizada com sucesso.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        let promises = this.currentSale.products?.map(product => {
          return this.balanceService.newMoviment(product.product as Products, product.quantity);
        })

        Promise.all(promises as any[]).then(() => {
          window.location.href = location.origin + '/app/sales/list';
        });

      });
    });
  }
}
