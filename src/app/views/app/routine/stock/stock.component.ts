import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../data/api.service';
import { getCompanyId } from '../../../../utils/util';
import { Options } from '../../../../components/select-default/select-default.interface';
import { Products } from '../../product/product.interface';
import { FormControl } from '@angular/forms';
import { BalanceService } from '../../../../data/balance.service';
import { ReportsService } from '../../../../shared/reports.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss'
})
export class StockComponent implements OnInit {
  products: Products[] = [];

  productsList: Options[] = [{ value: 0, label: 'Todos' }];
  productSelected = new FormControl('');

  dateInit = new FormControl('');
  dateEnd = new FormControl('');

  totalCost = 0;
  totalSale = 0;
  totalStock = 0;

  view: 'table' | 'chart' = 'table';

  constructor(
    private apiService: ApiService,
    private balanceService: BalanceService,
    private reportService: ReportsService,
  ) { }

  ngOnInit(): void {
    this.load();
    this.loadProducts();
  }

  load() {
    var filter: Products = {
      id_company: getCompanyId(),
      deleted: 'N'
    };

    if (this.productSelected.value && this.productSelected.value !== '0') {
      filter.id = Number(this.productSelected.value) as number;
    }

    this.apiService.findProducts({
      filter: filter
    }).then((response) => {
      this.products = response.results;
      this.totalCost = this.products.reduce((acc, product) => acc + (Number(product.price_cost) ?? 0), 0);
      this.totalSale = this.products.reduce((acc, product) => acc + (Number(product.price_sale) ?? 0), 0);
      this.totalStock = this.products.reduce((acc, product) => acc + (Number(product.stock) ?? 0), 0);
    });
  }

  loadProducts() {
    this.apiService.findProducts({
      filter: {
        id_company: getCompanyId(),
        deleted: 'N'
      }
    }).then((response) => {
      this.productsList.push(...response.results.map((product: Products) => {
        return {
          label: product.description,
          value: product.id
        };
      }));

      this.productSelected.setValue('0');
    });
  };

  generatePDF(product: Products) {
    this.balanceService.findMoviment({
      filter: {
        id_product: product.id,
        id_company: getCompanyId()
      }
    }).then((response) => {
      console.log(response);
      this.reportService.productReport({
        product: product,
        moviments: response.results
      })
    });
  }

  reports() {

  }

  changeView(view: 'table' | 'chart') {
    this.view = view;
    setTimeout(() => {
      // this.generateCharts();
    }, 500)
  }
}
