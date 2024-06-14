const prisma = require("../../models/prismaClient.js");

async function main() {
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

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
  }

  console.log("Categories created successfully");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
