const { PrismaClient } = require('@prisma/client');
const wilayasData = require('./Wilaya_Of_Algeria.json');
const communesData = require('./Commune_Of_Algeria.json');

const prisma = new PrismaClient();

async function populateDatabase() {
  try {
    for (const wilaya of wilayasData) {
      const {id, name } = wilaya;
        wilaya_name = name
        const filteredCommunes = communesData.filter(commune => commune.wilaya_id === id);
      for (const commune of filteredCommunes) {  
        const {name}     = commune;
            await prisma.address.create({
                data: {
                  wilaya: wilaya_name,
                  commune: name,
                },
              });
    }

    
    }
    console.log('Database populated successfully');

  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateDatabase();
