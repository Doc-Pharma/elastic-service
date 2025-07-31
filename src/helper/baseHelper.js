// baseHelper.js
class BaseHelper {
  constructor(model) {
    this.model = model;
  }

  //  Create a new record
  async create(data) {
    try {
      const newRecord = await this.model.create(data);
      return newRecord;
    } catch (error) {
      throw new Error(`Error creating record: ${error.message}`);
    }
  }

  /* Find one record
    inputData = {
        query : { id : 123},
        sortBy : [["priority", "ASC"]],
        populate_data : [
      {
        model: logistic_partners,
        as: "logistic", // Use the alias from association
        required: true,
        where: {
          is_active: true,
        },
      },
    ]
    }

    */
  async findOne(inputData) {
    try {
      let data = {};
      data.where = inputData.query ? inputData.query : {};
      if (inputData.sortBy) {
        data.sort = inputData.sortBy;
      }
      if (inputData.populate_data) {
        data.include = inputData.populate_data;
      }
      const record = await this.model.findOne(data);
      return record;
    } catch (error) {
      throw new Error(`Error finding record: ${error.message}`);
    }
  }

  /* Find all record
    inputData = {
        query : { id : 123},
        sortBy : [["priority", "ASC"]],
        populate_data : [
      {
        model: logistic_partners,
        as: "logistic", // Use the alias from association
        required: true,
        where: {
          is_active: true,
        },
      },
    ],
    page_size = 50;
    page = 1;
    }

    */
  async findAll(inputData) {
    try {
      let data = {};
      data.where = inputData.query ? inputData.query : {};
      if (inputData.sortBy) {
        data.order = inputData.sortBy;
      }
      if (inputData.populate_data) {
        data.include = inputData.populate_data;
      }
      data.limit = inputData.page_size ? inputData.page_size : 50;
      data.offset = inputData.page ? (inputData.page - 1) * data.limit : 0;
      const records = await this.model.findAll(data);
      return records;
    } catch (error) {
      throw new Error(`Error finding records: ${error.message}`);
    }
  }

  /*Update a record 
    query = {
        id:1223
    }
    data : {
        name:"nil"
    }
    */
  async update(query, data) {
    try {
      const updatedData = await this.model.update(data, {
        where: query,
        returning: true,
      });

      if (!updatedData) {
        throw new Error('Record not found to update');
      }

      return updatedData;
    } catch (error) {
      throw new Error(`Error updating record: ${error.message}`);
    }
  }

  // Delete a record
  async delete(query) {
    try {
      const deleted = await this.model.destroy({
        where: query,
      });

      if (!deleted) {
        throw new Error('Record not found to delete');
      }

      return { message: 'Record successfully deleted' };
    } catch (error) {
      throw new Error(`Error deleting record: ${error.message}`);
    }
  }
}

module.exports = BaseHelper;
