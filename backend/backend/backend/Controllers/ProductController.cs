using backend.Context;
using backend.Models;
using backend.Models.Dto;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext dbContext;
        private readonly Cloudinary cloudinary;
        public ProductController(AppDbContext _dbContext, Cloudinary _cloudinary)
        {
            dbContext = _dbContext;
            cloudinary = _cloudinary;
        }

        [HttpGet]
        [Route("Products")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await dbContext.Products.ToListAsync();
            var productDtos = products.Select(product => new
            {
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.ImageUrl,
                product.Inventory,
                product.Quantity,
                product.CategoryId
            }).ToList();
            

            return Ok(productDtos);
        }

        [HttpGet]
        [Route("ProductBy/{id:int}")]
        public async Task<IActionResult> GetOneProduct(int id)
        {
            var product = await dbContext.Products.FirstOrDefaultAsync(p => p.Id == id);

            if(product == null)
            {
                return NotFound(new { message = $"The product does not exist." });
            }

            var productDto = new 
            {
                product.Id,
                product.Name,
                product.Description,
                product.ImageUrl,
                product.Inventory,
                product.Price,
                product.Quantity,
                product.CategoryId
            };

            return Ok(productDto);
        }

        [HttpPost]
        [Route("Create")]
        public async Task<IActionResult> CreateProduct([FromForm] ProductDto productDto, [FromForm] IFormFile image)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string imageUrl = null;

            if (image != null)
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(image.FileName, image.OpenReadStream()),
                    AssetFolder = "admin_products_app"
                };

                var uploadResult = await cloudinary.UploadAsync(uploadParams);

                if (uploadResult == null || uploadResult.SecureUrl == null)
                {
                    return StatusCode(500, "Image upload failed");
                }

                imageUrl = uploadResult.SecureUrl.ToString();
            }

            var product = new Product
            {
                Name = productDto.Name,
                Description = productDto.Description,
                Price = productDto.Price,
                Quantity = productDto.Quantity,
                ImageUrl = imageUrl,
                Inventory = productDto.Inventory,
                CategoryId = productDto.CategoryId
            };

            dbContext.Products.Add(product);
            await dbContext.SaveChangesAsync();

            var result = new
            {
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.Quantity,
                product.ImageUrl,
                product.Inventory,
                product.CategoryId
            };

            return Ok(result);
        }

        [HttpPut]
        [Route("Update")]
        public async Task<IActionResult> UpdateProduct([FromForm] ProductDto productDto, [FromForm] IFormFile image)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            var product = await dbContext.Products.FindAsync(productDto.Id);
            
            if(product == null)
            {
                return NotFound(new { message = "El producto no ha sido encontrado" });
            }

            string imageUrl = null;

            if (image != null)
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(image.FileName, image.OpenReadStream()),
                    AssetFolder = "admin_products_app"
                };

                var uploadResult = await cloudinary.UploadAsync(uploadParams);

                if (uploadResult == null || uploadResult.SecureUrl == null)
                {
                    return StatusCode(500, "Image upload failed");
                }

                imageUrl = uploadResult.SecureUrl.ToString();
            }

            product.Name = productDto.Name;
            product.Description = productDto.Description;
            product.Price = productDto.Price;
            product.Quantity = productDto.Quantity;
            product.CategoryId = productDto.CategoryId;
            product.Inventory = productDto.Inventory;
            product.ImageUrl = imageUrl;

            await dbContext.SaveChangesAsync();

            var result = new
            {
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.Quantity,
                product.Inventory,
                product.CategoryId,
                product.ImageUrl
            };

            return Ok(result);
        }


        [HttpDelete]
        [Route("Remove/{id:int}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await dbContext.Products.FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = $"The product does not exist." });
            }

            dbContext.Products.Remove(product);
            await dbContext.SaveChangesAsync();
            return Ok(new {message = "Product successfully removed"});
        }
    }
}
