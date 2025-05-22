<template>
  <div>
    <q-card :flat="!card" :bordered="showBorder" :class="showBorder ? 'q-pa-sm q-ma-sm' : ''">
      <div v-if="showTitle">
        <div v-if="!card" class="text-bold q-pa-sm" style="font-size: 20px;">Campos Personalizados</div>
        <div v-else class="bg-grey-9 q-pa-md text-bold text-white q-pl-lg card-title">Campos Personalizados</div>
      </div>
      <div class="row" :class="!card? '': 'q-pa-md'">
        <!-- Fields -->
        <div v-for="(field, index) in customFields" :key="index" class="col-12 col-md-6">
          <div class="row">
            <div class="col">
              <InputField :dense="dense" Icon="fas fa-pen" :readonly="readonly" clearable
                v-model="this.customFieldsValues[field.name]" :type="typeDictionary[field.type]"
                :Label="`${field.label}${field.required === 'Y' ? '*' : ''}`"
                :Error="field.required ? valuesError[field.name] : false"
                @focus="() => { if (valuesError[field.name]) valuesError[field.name] = false }">
              </InputField>
            </div>
            <div v-if="!(readonly || formMode)" class="col-auto flex justify-center items-center">
              <q-btn class="q-mx-sm" icon="fas fa-minus" color="negative" label="" dense round outline
                @click="remove(field)">
                <q-tooltip>Remover Campo</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
        <div class="col-6 flex justify-start items-center">
          <!-- Button -->
          <q-btn v-if="!(readonly || formMode)" class="q-ma-sm" icon="fas fa-plus" color="primary"
            label="Adicionar Campo" :dense="dense" outline @click="showModal = true">
            <q-tooltip>Adiciona um Campo Personalizado</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card>

    <!-- Modal -->
    <Modal Title="Novo Campo Personalizado" Icon="fas fa-pencil" Persistent v-model="showModal" :Actions="modalActions"
      @hide="resetInput">
      <q-card flat bordered class="q-pa-sm q-ma-sm text-amber-8 text-justify bg-yellow-1 border-amber-7">
        <div>
          <q-icon name="fas fa-triangle-exclamation" style="padding-bottom: 3px;"></q-icon>
          Ao adicionar um campo customizado, ele será adicionado a TODOS os cadastros de Associado, incluindo também o
          cadastro de associação encontrado no app. <span class="text-bold">OBS:</span> Campos obrigatórios exigirão ser
          preenchidos ao tentar atualizar um Associado já cadastrado.
        </div>
      </q-card>
      <div class="row">
        <div class="col-12">
          <InputField Label="Nome" Icon="fas fa-pen-clip" type="text" v-model="input.ds_fieldlabel"
            :Error="inputError.ds_fieldlabel" @focus="inputError.ds_fieldlabel = false">
          </InputField>
        </div>
        <div class="col-12 row">
          <InputField class="col-7" Label="Tipo" Icon="fas fa-puzzle-piece" type="select" v-model="input.do_fieldtype"
            :Options="types" :Error="inputError.ds_fieldlabel" @focus="inputError.ds_fieldlabel = false">
          </InputField>
          <q-toggle class="col" size="lg" trueValue="Y" falseValue="N" color="green" icon="fas fa-check"
            v-model="input.do_is_required"
            :label="input.do_is_required == 'Y' ? 'Campo Obrigatório' : 'Campo Opcional'">
          </q-toggle>
        </div>

        <!-- <div class="col-12 col-md-12 q-pl-xs">
          <InputField Label="Regras de preenchimento do campo" Icon="fas fa-square-pen" type="textarea" dense v-model="input.tx_rules">
          </InputField>
        </div> -->
      </div>
    </Modal>
  </div>
</template>

<script>
// Services:
import { ENDPOINTS } from 'src/services/endpoints'

// Components:
export default {
  name: 'components-common-customfields',

  props: {
    card: Boolean,
    dense: Boolean,
    readonly: Boolean,
    formMode: Boolean,
    showTitle: Boolean,
    showBorder: Boolean,
    entityName: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      permissions: {
        // create: Permissions.validatePermissions({ 'MQV_RECIPE_SUPPLY_ASSOC': 'C' }),
        // update: Permissions.validatePermissions({ 'MQV_RECIPE_SUPPLY_ASSOC': 'U' }),
        // delete: Permissions.validatePermissions({ 'MQV_RECIPE_SUPPLY_ASSOC': 'D' }),
      },
      // Modal related
      showModal: false,
      input: {
        ds_entityName: this.entityName,
        ds_fieldlabel: null,
        do_fieldtype: null,
        do_is_required: 'N',
        tx_rules: null,
      },
      inputError: {
        ds_fieldlabel: false,
        do_fieldtype: false,
        do_is_required: false,
      },
      types: [
        { label: 'Texto', value: 'T' },
        { label: 'Número', value: 'N' },
      ],
      typeDictionary: {
        T: 'text',
        N: 'number',
      },
      customFields: [],
      customFieldsValues: {},
      valuesError: {},
    }
  },
  computed: {
    modalActions() {
      return [
        { label: 'Salvar', color: 'green', icon: 'save', fn: this.save },
      ]
    },

    factory() {
      return {
        input: { ...this.customFieldsValues },
        read: this.readValues,
        validate: this.validateValues,
      }
    }
  },

  methods: {
    validateValues() {
      return this.$utils.validateForm(this.customFieldsValues, this.valuesError);
    },

    readValues(source) {
      for (let key in this.customFieldsValues) {
        if (key in source) {
          this.customFieldsValues[key] = source[key];
        }
      }
    },

    resetInput() {
      for (let k in this.input) {
        if (k == 'ds_entityName')
          this.input[k] = this.entityName;
        else if (k == 'do_is_required')
          this.input[k] = 'N';
        else
          this.input[k] = null;

        if (k in this.inputError)
          this.inputError[k] = false;
      }
    },

    // Remove the RECORD of the field from the DB
    async remove(field) {
      // Confirmation
      if (!confirm('Deseja excluir as informações? (Isso afetará todos os registros)')) return false;

      // Emitting the loading event
      this.$emit('load', 'field-remove');

      // Api Request
      try {
        await this.$http.delete(`${ENDPOINTS.SETTINGS_CUSTOMFIELD}/${this.entityName}/${field.name}`);
        this.$utils.notify({
          message: 'O campo foi excluído com sucesso',
          type: 'positive',
          position: 'top-right'
        });
        // Remove the field/value from the local variables
        this.customFields.splice(this.customFields.findIndex(item => item.name === field.name), 1);
        delete this.customFieldsValues[field.name];
        delete this.valuesError[field.name];
      } catch (error) {
        this.$utils.notifyError(error);
        console.error("An error occurred while attempting to delete the object.", error);
      } finally {
        // Finalizing the loading event
        this.$emit('loaded', 'field-remove');
      };
    },

    // Create the RECORD of the field
    async save() {
      // Validation
      if (!this.$utils.validateForm(this.input, this.inputError)) return;

      // Emitting the loading event
      this.$emit('load', 'field-save');

      // Setting data for upload
      let data = new FormData();
      for (let item in this.input) {
        data.set(item, this.input[item]);
      }

      // Api Request
      try {
        await this.$http.post(ENDPOINTS.SETTINGS_CUSTOMFIELD, data)
        this.$utils.notify({
          message: 'O campo foi criado com sucesso',
          type: 'positive',
          position: 'top-right'
        });
        // Reload Custom Fields locally
        await this.getCustomFields();
        // Close the Modal
        this.showModal = false;
      } catch (error) {
        this.$utils.notifyError(error);
        console.error('An error occurred while attempting to create/update the object.', error);
      } finally {
        // Finalizing the loading event
        this.$emit('loaded', 'field-save');
      }
    },

    // Load the list of all custom fields related to the entity
    async getCustomFields() {
      // Emitting the loading event
      this.$eventbroadcaster.$broadcast('load', 'fields-read');
      try {
        const response = await this.$http.get(`${ENDPOINTS.SETTINGS_CUSTOMFIELD}/${this.entityName}`);
        this.customFields = [];
        if (response && response.data) {
          for (let i = 0; i < response.data.length; i++) {
            let field = response.data[i];

            // Preenche o array
            this.customFields.push({
              name: field.ds_fieldname,
              label: field.ds_fieldlabel,
              type: field.do_fieldtype,
              required: field.do_is_required,
              // rules: field.tx_rules,
            })

            // Gerencia valores dos campos
            this.customFieldsValues[field.ds_fieldname] = this.customFieldsValues[field.ds_fieldname] || null;

            // Gerencia validação dos valores
            if (field.do_is_required === 'Y') {
              this.valuesError[field.ds_fieldname] = false;
            }
          };
        }
      } catch (error) {
        console.error("An error occurred while attempting to retrieve the custom fields' data.", error);
      } finally {
        // Finalizing the loading event
        this.$eventbroadcaster.$broadcast('loaded', 'fields-read');
      }
    }
  },

  watch: {
    customFieldsValues: {
      handler() {
        this.$emit("update:model-value", this.factory);
      },
      deep: true,
    },

    modelValue: {
      handler(newValue) {
        for (let key in this.customFieldsValues) {
          if (key in newValue) {
            this.customFieldsValues[key] = newValue[key];
          }
        }
      },
      deep: true,
    },
  },

  async created() {
    this.$emit("update:model-value", this.factory);
    await this.getCustomFields();
  }
}
</script>
<style scoped>
.card-title {
  font-size: 16px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
</style>