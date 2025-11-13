// ============================================
// MongoDB Initialization Script
// Customer Assistant Agent - Product Catalog
// ============================================

// Connect to the product_catalog database
db = db.getSiblingDB('product_catalog');

// Create application user
db.createUser({
  user: 'product_user',
  pwd: 'product_password_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'product_catalog'
    }
  ]
});

print('✅ Created product_user with readWrite permissions');

// ============================================
// COLLECTION: brands
// ============================================
db.createCollection('brands', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'isActive'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Brand name - required'
        },
        description: {
          bsonType: 'string',
          description: 'Brand description'
        },
        logoUrl: {
          bsonType: 'string',
          description: 'Brand logo URL'
        },
        websiteUrl: {
          bsonType: 'string',
          description: 'Brand website URL'
        },
        isActive: {
          bsonType: 'bool',
          description: 'Active status - required'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

// Insert sample brands
db.brands.insertMany([
  {
    name: 'IVIGO',
    description: 'Panel konvektör, havlu ısıtıcı, fanlı ısıtıcı ve ayak ısıtıcı ürünleri',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'MASTAŞ',
    description: 'Su bazlı panel radyatör ve havlu radyatör sistemleri',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'SOLARIS',
    description: 'Panel konvektör sistemleri',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'POTPRESSO',
    description: 'Türk kahve makineleri',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('✅ Created brands collection with sample data');

// ============================================
// COLLECTION: product_categories
// ============================================
db.createCollection('product_categories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'isActive'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Category name - required'
        },
        description: {
          bsonType: 'string'
        },
        parentCategoryId: {
          bsonType: 'objectId',
          description: 'Parent category reference'
        },
        isActive: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Insert sample categories
db.product_categories.insertMany([
  {
    name: 'Panel Konvektör',
    description: 'Elektrikli panel tipi konvektör ısıtıcılar',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Havlu Isıtıcı',
    description: 'Elektrikli ve su bazlı havlu ısıtıcıları',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Fanlı Isıtıcı',
    description: 'Fan destekli konvektör ısıtıcılar',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Ayak Isıtıcı',
    description: 'Masa altı ayak ısıtıcı sistemleri',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Kahve Makinesi',
    description: 'Türk kahve makineleri',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('✅ Created product_categories collection with sample data');

// ============================================
// COLLECTION: products
// ============================================
db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['brandId', 'categoryId', 'modelCode', 'name', 'isActive'],
      properties: {
        brandId: {
          bsonType: 'objectId',
          description: 'Brand reference - required'
        },
        categoryId: {
          bsonType: 'objectId',
          description: 'Category reference - required'
        },
        modelCode: {
          bsonType: 'string',
          description: 'Product model code - required'
        },
        name: {
          bsonType: 'string',
          description: 'Product name - required'
        },
        description: {
          bsonType: 'string'
        },
        productType: {
          bsonType: 'string',
          description: 'Product type (Manuel, Dijital, WiFi, etc.)'
        },
        powerWatt: {
          bsonType: 'int',
          description: 'Power consumption in watts'
        },
        imageUrl: {
          bsonType: 'string'
        },
        price: {
          bsonType: 'decimal',
          description: 'Product price'
        },
        currency: {
          bsonType: 'string',
          enum: ['TRY', 'USD', 'EUR']
        },
        isActive: {
          bsonType: 'bool'
        },
        metadata: {
          bsonType: 'object'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Get IDs for relationships
const ivigoBrand = db.brands.findOne({name: 'IVIGO'});
const panelCategory = db.product_categories.findOne({name: 'Panel Konvektör'});

// Insert sample products
db.products.insertMany([
  {
    brandId: ivigoBrand._id,
    categoryId: panelCategory._id,
    modelCode: 'EPK4550M05',
    name: 'IVIGO Panel Konvektör Manuel 500W',
    description: 'Panel konvektör, mekanik termostat, 500W',
    productType: 'Manuel',
    powerWatt: 500,
    price: NumberDecimal("1299.00"),
    currency: 'TRY',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    brandId: ivigoBrand._id,
    categoryId: panelCategory._id,
    modelCode: 'EPK4550E10',
    name: 'IVIGO Panel Konvektör Dijital 1000W',
    description: 'Panel konvektör, elektronik oda sıcaklık kontrolü, 1000W',
    productType: 'Dijital',
    powerWatt: 1000,
    price: NumberDecimal("1899.00"),
    currency: 'TRY',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    brandId: ivigoBrand._id,
    categoryId: panelCategory._id,
    modelCode: 'EPK4590E25-W',
    name: 'IVIGO Panel Konvektör WiFi 2500W',
    description: 'Panel konvektör, WiFi akıllı kontrol, 2500W',
    productType: 'WiFi',
    powerWatt: 2500,
    price: NumberDecimal("3499.00"),
    currency: 'TRY',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('✅ Created products collection with sample data');

// ============================================
// COLLECTION: technical_specifications
// ============================================
db.createCollection('technical_specifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['productId', 'specName', 'specValue'],
      properties: {
        productId: {
          bsonType: 'objectId'
        },
        specName: {
          bsonType: 'string',
          description: 'Specification name (e.g., "Güç", "Boyut")'
        },
        specValue: {
          bsonType: 'string',
          description: 'Specification value'
        },
        specUnit: {
          bsonType: 'string',
          description: 'Unit (e.g., "W", "cm", "kg")'
        },
        isSearchable: {
          bsonType: 'bool',
          description: 'Include in search'
        },
        displayOrder: {
          bsonType: 'int'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

print('✅ Created technical_specifications collection');

// ============================================
// COLLECTION: error_codes
// ============================================
db.createCollection('error_codes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['errorCode', 'errorName', 'description', 'severity'],
      properties: {
        productId: {
          bsonType: 'objectId',
          description: 'Product reference (null for generic errors)'
        },
        errorCode: {
          bsonType: 'string',
          description: 'Error code (e.g., "dE", "PE", "CE")'
        },
        errorName: {
          bsonType: 'string',
          description: 'Error name'
        },
        description: {
          bsonType: 'string',
          description: 'Detailed error description'
        },
        errorType: {
          bsonType: 'string',
          description: 'Error type category'
        },
        severity: {
          bsonType: 'string',
          enum: ['Düşük', 'Orta', 'Yüksek', 'Kritik'],
          description: 'Error severity level'
        },
        isActive: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Insert sample error codes
db.error_codes.insertMany([
  {
    errorCode: 'dE',
    errorName: 'Devrilme Hatası',
    description: 'Cihaz devrilme sensörü aktif oldu. Güvenlik nedeniyle cihaz kapandı.',
    errorType: 'Güvenlik',
    severity: 'Yüksek',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    errorCode: 'PE',
    errorName: 'Fiş Isınma Hatası',
    description: 'Elektrik fişi veya priz aşırı ısındı. Bağlantı problemli.',
    errorType: 'Elektrik',
    severity: 'Kritik',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    errorCode: 'CE',
    errorName: 'İşlemci Isınma Hatası',
    description: 'Cihaz iç sıcaklığı aşırı yükseldi.',
    errorType: 'Donanım',
    severity: 'Yüksek',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('✅ Created error_codes collection with sample data');

// ============================================
// COLLECTION: error_solutions
// ============================================
db.createCollection('error_solutions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['errorCodeId', 'stepNumber', 'description'],
      properties: {
        errorCodeId: {
          bsonType: 'objectId',
          description: 'Error code reference'
        },
        stepNumber: {
          bsonType: 'int',
          description: 'Solution step order'
        },
        stepTitle: {
          bsonType: 'string'
        },
        description: {
          bsonType: 'string',
          description: 'Solution step description'
        },
        isRequired: {
          bsonType: 'bool',
          description: 'Is this step mandatory?'
        },
        requiresTechnician: {
          bsonType: 'bool',
          description: 'Does this require a technician?'
        },
        estimatedTime: {
          bsonType: 'int',
          description: 'Estimated time in minutes'
        },
        videoUrl: {
          bsonType: 'string'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

print('✅ Created error_solutions collection');

// ============================================
// COLLECTION: display_codes
// ============================================
db.createCollection('display_codes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['displayCode', 'displayName', 'description'],
      properties: {
        productId: {
          bsonType: 'objectId'
        },
        displayCode: {
          bsonType: 'string',
          description: 'Display code (e.g., "L0", "UL", "SLEP")'
        },
        displayName: {
          bsonType: 'string'
        },
        description: {
          bsonType: 'string'
        },
        codeType: {
          bsonType: 'string',
          description: 'Code category'
        },
        isNormal: {
          bsonType: 'bool',
          description: 'Is this a normal display?'
        },
        requiresAction: {
          bsonType: 'bool',
          description: 'Does user need to take action?'
        },
        videoUrl: {
          bsonType: 'string'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

print('✅ Created display_codes collection');

// ============================================
// COLLECTION: faq_categories
// ============================================
db.createCollection('faq_categories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name'],
      properties: {
        name: {
          bsonType: 'string'
        },
        description: {
          bsonType: 'string'
        },
        displayOrder: {
          bsonType: 'int'
        },
        isActive: {
          bsonType: 'bool'
        }
      }
    }
  }
});

print('✅ Created faq_categories collection');

// ============================================
// COLLECTION: faqs
// ============================================
db.createCollection('faqs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['question', 'answer'],
      properties: {
        productId: {
          bsonType: 'objectId'
        },
        faqCategoryId: {
          bsonType: 'objectId'
        },
        question: {
          bsonType: 'string'
        },
        answer: {
          bsonType: 'string'
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        viewCount: {
          bsonType: 'int'
        },
        isActive: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

print('✅ Created faqs collection');

// ============================================
// COLLECTION: documents
// ============================================
db.createCollection('documents', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'documentType'],
      properties: {
        productId: {
          bsonType: 'objectId'
        },
        title: {
          bsonType: 'string'
        },
        description: {
          bsonType: 'string'
        },
        documentType: {
          bsonType: 'string',
          enum: ['Kullanım Kılavuzu', 'Montaj Kılavuzu', 'Teknik Doküman', 'Garanti Belgesi']
        },
        version: {
          bsonType: 'string'
        },
        language: {
          bsonType: 'string',
          enum: ['tr', 'en']
        },
        pdfUrl: {
          bsonType: 'string'
        },
        isActive: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

print('✅ Created documents collection');

// ============================================
// COLLECTION: document_sections
// ============================================
db.createCollection('document_sections', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['documentId', 'sectionTitle', 'content'],
      properties: {
        documentId: {
          bsonType: 'objectId'
        },
        sectionNumber: {
          bsonType: 'string'
        },
        sectionTitle: {
          bsonType: 'string'
        },
        content: {
          bsonType: 'string'
        },
        isImportant: {
          bsonType: 'bool'
        },
        isSafetyRelated: {
          bsonType: 'bool'
        },
        searchWeight: {
          bsonType: 'double',
          description: 'Search priority weight'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

print('✅ Created document_sections collection');

// ============================================
// COLLECTION: instructions
// ============================================
db.createCollection('instructions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['productId', 'instructionType', 'stepNumber', 'title', 'content'],
      properties: {
        productId: {
          bsonType: 'objectId'
        },
        instructionType: {
          bsonType: 'string',
          enum: ['Kurulum', 'Kullanım', 'Bakım', 'Temizlik', 'Sorun Giderme']
        },
        stepNumber: {
          bsonType: 'int'
        },
        title: {
          bsonType: 'string'
        },
        content: {
          bsonType: 'string'
        },
        isWarning: {
          bsonType: 'bool'
        },
        isCritical: {
          bsonType: 'bool'
        },
        requiresTechnician: {
          bsonType: 'bool'
        },
        imageUrl: {
          bsonType: 'string'
        },
        videoUrl: {
          bsonType: 'string'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

print('✅ Created instructions collection');

// ============================================
// COLLECTION: safety_warnings
// ============================================
db.createCollection('safety_warnings', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content', 'severity'],
      properties: {
        productId: {
          bsonType: 'objectId'
        },
        warningType: {
          bsonType: 'string',
          enum: ['Genel', 'Elektrik', 'Yangın', 'Yaralanma', 'Çocuk Güvenliği']
        },
        title: {
          bsonType: 'string'
        },
        content: {
          bsonType: 'string'
        },
        severity: {
          bsonType: 'string',
          enum: ['Düşük', 'Orta', 'Yüksek', 'Kritik']
        },
        iconUrl: {
          bsonType: 'string'
        },
        isActive: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

print('✅ Created safety_warnings collection');

// ============================================
// CREATE INDEXES
// ============================================

// Brands indexes
db.brands.createIndex({ name: 1 }, { unique: true });
db.brands.createIndex({ isActive: 1 });

// Product categories indexes
db.product_categories.createIndex({ name: 1 }, { unique: true });
db.product_categories.createIndex({ parentCategoryId: 1 });
db.product_categories.createIndex({ isActive: 1 });

// Products indexes
db.products.createIndex({ modelCode: 1 }, { unique: true });
db.products.createIndex({ brandId: 1 });
db.products.createIndex({ categoryId: 1 });
db.products.createIndex({ isActive: 1 });
db.products.createIndex({ name: 'text', description: 'text' });

// Technical specifications indexes
db.technical_specifications.createIndex({ productId: 1 });
db.technical_specifications.createIndex({ specName: 1 });

// Error codes indexes
db.error_codes.createIndex({ errorCode: 1 });
db.error_codes.createIndex({ productId: 1 });
db.error_codes.createIndex({ severity: 1 });

// Error solutions indexes
db.error_solutions.createIndex({ errorCodeId: 1 });
db.error_solutions.createIndex({ stepNumber: 1 });

// Display codes indexes
db.display_codes.createIndex({ displayCode: 1 });
db.display_codes.createIndex({ productId: 1 });

// FAQs indexes
db.faqs.createIndex({ productId: 1 });
db.faqs.createIndex({ faqCategoryId: 1 });
db.faqs.createIndex({ question: 'text', answer: 'text' });

// Documents indexes
db.documents.createIndex({ productId: 1 });
db.documents.createIndex({ documentType: 1 });

// Document sections indexes
db.document_sections.createIndex({ documentId: 1 });
db.document_sections.createIndex({ content: 'text' });

// Instructions indexes
db.instructions.createIndex({ productId: 1 });
db.instructions.createIndex({ instructionType: 1 });
db.instructions.createIndex({ stepNumber: 1 });

// Safety warnings indexes
db.safety_warnings.createIndex({ productId: 1 });
db.safety_warnings.createIndex({ warningType: 1 });
db.safety_warnings.createIndex({ severity: 1 });

print('✅ Created all indexes');

// ============================================
// SUCCESS MESSAGE
// ============================================
print('');
print('========================================');
print('✅ MongoDB initialization completed!');
print('========================================');
print('📦 Database: product_catalog');
print('👤 User: product_user');
print('🗂️  Collections created: 15');
print('📇 Indexes created: 30+');
print('📊 Sample data inserted');
print('========================================');
