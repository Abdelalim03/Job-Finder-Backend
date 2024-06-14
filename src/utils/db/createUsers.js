const prisma = require("../../models/prismaClient.js");
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const categories = [
  {
    name: "IKEA Furniture Assembly",
    description: "Assembly services for IKEA furniture",
  },
  {
    name: "Furniture Assembly",
    description: "General furniture assembly services",
  },
  {
    name: "Wall Mounting",
    description: "Wall mounting services for TV, artwork, etc.",
  },
  { name: "Minor Repairs", description: "Services for small repair tasks" },
  { name: "Plumbing", description: "Plumbing services for various needs" },
  { name: "Electrical Work", description: "Electrical work and repairs" },
  {
    name: "Moving",
    description: "Moving services for households and offices",
  },
  {
    name: "PAX Assembly",
    description: "Assembly services for IKEA PAX furniture",
  },
  {
    name: "Carpentry",
    description: "Carpentry services for building and repairs",
  },
  {
    name: "Painting",
    description: "Painting services for homes and offices",
  },
  { name: "Gardening", description: "Gardening and landscaping services" },
  {
    name: "Cleaning",
    description: "Cleaning services for residential and commercial spaces",
  },
  {
    name: "Handyman Services",
    description: "General handyman services for various tasks",
  },
];

async function main() {
  const users = [
    {
        firstName: 'Amine',
        lastName: 'Boukhatem',
        email: 'amine.boukhatem@example.com',
        phoneNumber: '0550123456',
        password: 'Test123$',
        addresses: [
            { wilaya: 'Setif' },
            { wilaya: 'Batna', commune: 'Ain Yagout' },
            { wilaya: 'Oran', commune: 'Es Senia' }
        ]
    },
    {
        firstName: 'Lina',
        lastName: 'Saadi',
        email: 'lina.saadi@example.com',
        phoneNumber: '0551654321',
        password: 'Test123$',
        addresses: [
            { wilaya: 'Annaba', commune: 'El Hadjar' },
            { wilaya: 'Skikda', commune: 'Ain Charchar' },
            { wilaya: 'Constantine', commune: 'Didouche Mourad' }
        ]
    },
    {
        firstName: 'Riad',
        lastName: 'Hamdi',
        email: 'riad.hamdi@example.com',
        phoneNumber: '0552234567',
        password: 'Test123$',
        addresses: [
            { wilaya: 'Blida', commune: 'Bouinan' },
            { wilaya: 'Djelfa', commune: 'Ain El Ibel' },
            { wilaya: 'Tipaza', commune: 'Bou Haroun' }
        ]
    },
    {
        firstName: 'Yasmina',
        lastName: 'Mehdi',
        email: 'yasmina.mehdi@example.com',
        phoneNumber: '0553765432',
        password: 'Test123$',
        addresses: [
            { wilaya: 'Adrar', commune: 'Reggane' },
            { wilaya: 'Ghardaia'},
            { wilaya: 'Tindouf', commune: 'Tindouf' }
        ]
    },
    {
        firstName: 'Mohamed',
        lastName: 'Belkacem',
        email: 'mohamed.belkacem@example.com',
        phoneNumber: '0554345678',
        password: 'Test123$',
        addresses: [
            { wilaya: 'Tizi Ouzou', commune: 'Boghni' },
            { wilaya: 'Bejaia', commune: 'Aokas' },
            { wilaya: 'Bouira', commune: 'Sour El Ghozlane' }
        ]
    },
    {
        firstName: 'Sara',
        lastName: 'Bensalem',
        email: 'sara.bensalem@example.com',
        phoneNumber: '0555876543',
        password: 'Test123$',
        addresses: [
            { wilaya: 'Algiers', commune: 'Bab El Oued' },
            { wilaya: 'Blida', commune: 'Beni Tamou' },
            { wilaya: 'Boumerdes', commune: 'Boudouaou' }
        ]
    },
    {
        firstName: 'Karim',
        lastName: 'Kouider',
        email: 'karim.kouider@example.com',
        phoneNumber: '0556456789',
        password: 'Test123$',
        addresses: [
            { wilaya: 'Sidi Bel Abbes', commune: 'Sidi Ali Benyoub' },
            { wilaya: 'Oran', commune: 'Arzew' },
            { wilaya: 'Mostaganem', commune: 'Achaacha' }
        ]
    },
    {
        firstName: 'Nadia',
        lastName: 'Tarek',
        email: 'nadia.tarek@example.com',
        phoneNumber: '0557987654',
        password: 'Test123$',
        addresses: [
            { wilaya: 'Batna', commune: 'Merouana' },
            { wilaya: 'Khenchela', commune: 'Chechar' },
            { wilaya: 'Biskra', commune: 'Tolga' }
        ]
    },
    {
        firstName: 'Hakim',
        lastName: 'Ait',
        email: 'hakim.ait@example.com',
        phoneNumber: '0558567890',
        password: 'Test123$',
        addresses: [
            { wilaya: 'Annaba', commune: 'Berrahal' },
            { wilaya: 'El Tarf', commune: 'Ben M Hidi' },
            { wilaya: 'Souk Ahras', commune: 'Sedrata' }
        ]
    },
    {
        firstName: 'Meriem',
        lastName: 'Chikhi',
        email: 'meriem.chikhi@example.com',
        phoneNumber: '0559098765',
        password: 'Test123$',
        addresses: [
            { wilaya: 'Tlemcen', commune: 'Ghazaouet' },
            { wilaya: 'Sidi Bel Abbes', commune: 'Sidi Ali Benyoub' },
            { wilaya: 'Ain Temouchent', commune: 'El Amria' }
        ]
    },
    {
        firstName: 'Sofiane',
        lastName: 'Djebar',
        email: 'sofiane.djebar@example.com',
        phoneNumber: '0560678901',
        password: 'Test123$',
        addresses: [
            { wilaya: 'El Oued', commune: 'Debila' },
            { wilaya: 'Ouargla', commune: 'Hassi Messaoud' },
            { wilaya: 'Illizi', commune: 'Djanet' }
        ]
    },
    {
        firstName: 'Amina',
        lastName: 'Rahmani',
        email: 'amina.rahmani@example.com',
        phoneNumber: '0561109876',
        password: 'Test123$',
        addresses: [
            { wilaya: 'Medea', commune: 'Chiffa' },
            { wilaya: 'Chlef', commune: 'Tenes' },
            { wilaya: 'Ain Defla', commune: 'Miliana' }
        ]
    },
];

  const clientEmails = ['lina.saadi@example.com', 'yasmina.mehdi@example.com', 'nadia.tarek@example.com'];

  for (const [index, user] of users.entries()) {
    const hashedPassword = await hashPassword(user.password);
    const createdUser = await prisma.user.create({
      data: {
        firstName:user.firstName,
        lastName:user.lastName,
        email:user.email,
        phoneNumber:user.phoneNumber,
        password: hashedPassword,
      },
    });

    if (clientEmails.includes(user.email)) {
      await prisma.client.create({
        data: {
          userId: createdUser.id,
        },
      });
    } else if (index < categories.length) {
      const tasker = await prisma.tasker.create({
        data: {
          userId: createdUser.id,
          description: `Providing top-notch ${categories[index].name.toLowerCase()} with professional experience in ${categories[index].description.toLowerCase()}. Satisfaction guaranteed for all clients.`,
          profilePicture:"default.png",
        },
      });

      for (let index = 0; index < user?.addresses?.length; index++) {
        const address = user?.addresses[index];
        let addresses = await prisma.address.findMany({
          where: {
            wilaya: address["wilaya"],
            commune: address["commune"],
          },
        });
  
        payload = addresses.map((add) => ({
          addressId: add.id,
          taskerId: tasker.userId,
        }));
  
        await prisma.taskerAddress.createMany({
          data: payload,
        });
      }

      // await prisma.category.upsert({
      //   where: { name: categories[index].name },
      //   update: {},
      //   create: categories[index],
      // });
    }
  }

  console.log('Users, Taskers, and Clients created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
