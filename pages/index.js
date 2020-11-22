import axios from 'axios';
import { EmptyState, Layout, Page, TextField, Select } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import config from '../app/libs/config.js';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

class Index extends React.Component {
  state = {key_service: '', company_id: '', user_id: '', select_option: '' };
  render() {
    const options = [
      {label: 'Once a day', value: '1'},
      {label: 'Once every two days', value: '2'}
    ];
    return (
      <Page>
        <TitleBar
          title="Welcome"
        />
        <Layout>
          <EmptyState
            heading="Please input Server information!"
            action={{
              content: 'Save',
              onAction: () => this.saveData(),
            }}
            image={img}
          >
            <Select
              label="Select Type"
              options={options}
              onChange={this.changeOption}
              value={this.state.select_option}
            />
            <TextField label="Clave Servicio" value={this.state.key_service === null ? '' : this.state.key_service} onChange={this.changeKeyService} />
            <TextField label="IdEmpresa" value={this.state.company_id === null ? '' : this.state.company_id} onChange={this.changeCompanyId} />
            <TextField label="IdUsuario" value={this.state.user_id === null ? '' : this.state.user_id} onChange={this.changeUserId} />
          </EmptyState>
        </Layout>
      </Page>
    );
  }
  changeKeyService = (value) => {
    this.setState({ key_service: value })
  };
  changeUserId = (value) => {
    this.setState({ user_id: value })
  };
  changeCompanyId = (value) => {
    this.setState({ company_id: value })
  };
  changeOption = (value) => {
    this.setState({ select_option: value })
  };
  saveData = () => {
    let res = axios.post(config.api_url + 'saveData', { key_service: this.state.key_service, company_id: this.state.company_id, user_id: this.state.user_id , option: this.state.select_option});
    alert("Saved Successfully!")
  };
}

export default Index;