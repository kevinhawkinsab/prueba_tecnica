using backend.Context;
using backend.Models;
using backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    public class CategoryController: ControllerBase
    {
        private readonly AppDbContext dbContext;

        public CategoryController(AppDbContext _dbContext)
        {
            dbContext = _dbContext;
        }

        [HttpGet]
        [Route("Categories")]
        public async Task<IActionResult> getCategories() {
            var categories = await dbContext.Categories.ToListAsync();
            var categoriesDtos = categories.Select(category => new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
            }).ToList();

            return Ok(categoriesDtos);
        }

        [HttpPost]
        [Route("Create")]
        public async Task<IActionResult> createCategory([FromBody] CategoryDto categoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var category = new Category
            {
                Name = categoryDto.Name,
            };

            dbContext.Categories.Add(category);
            await dbContext.SaveChangesAsync();

            return Ok(new { category.Id, category.Name });
        }
    }
}
