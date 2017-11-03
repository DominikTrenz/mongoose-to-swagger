'use strict';

const adjustType = type => {
  let newType;
  if (type === 'ObjectId' || type === 'ObjectID') {
    newType = 'object';
  } else {
    newType = type;
  }
  return newType.toLowerCase();
};

function documentModel(Model) {
  const modelName = Model.modelName;
  const obj = {
    id: modelName,
    title: modelName,
    properties: {}
  };

  const pathsToSchema = (parent, paths) => {
    Object.keys(paths).map(x => paths[x]).forEach(mongooseProp => {
      parent[mongooseProp.path] = {};
      if (mongooseProp.options.docu == false) {
        delete parent[mongooseProp.path];
        return;
      }
      const modelProp = parent[mongooseProp.path];

      if (mongooseProp.instance === 'Array') {
        modelProp.type = 'array';
        modelProp.items = {
          title: mongooseProp.options.alias,
          properties: {}
        };
        if (mongooseProp.schema) {
          pathsToSchema(modelProp.items.properties, mongooseProp.schema.paths);
        } else {
          modelProp.items = {
            type: 'object'
          };
        }
      } else if (mongooseProp.instance === 'Embedded') {
        modelProp.properties = {};
        modelProp.type = 'object';
        pathsToSchema(modelProp.properties, mongooseProp.schema.paths);
      } else if (mongooseProp.instance === 'ObjectID') {
        modelProp.type = 'string';
        modelProp.required = mongooseProp.isRequired || false;
      } else if (mongooseProp.instance === 'Date') {
        modelProp.type = 'string';
        modelProp.format = 'date';
        modelProp.required = mongooseProp.isRequired || false;
      } else {
        modelProp.type = adjustType(mongooseProp.instance);
        if(mongooseProp.enumValues && mongooseProp.enumValues.length>0){
          modelProp.enum = mongooseProp.enumValues;
        }
        modelProp.required = mongooseProp.isRequired || false;
      }
    });
  };

  pathsToSchema(obj.properties, Model.schema.paths);

  return obj;
}

documentModel.adjustType = adjustType;

module.exports = documentModel;
