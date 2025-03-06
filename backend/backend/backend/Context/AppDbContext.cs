using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Context
{
    public class AppDbContext: DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>(tb =>
            {
                tb.HasKey(col => col.Id);
                tb.Property(col => col.Id).UseIdentityColumn().ValueGeneratedOnAdd();

                tb.Property(col => col.Name).HasMaxLength(60);
            });

            modelBuilder.Entity<Category>(tb =>
            {
                tb.HasKey(col => col.Id);
                tb.Property(col => col.Id).UseIdentityColumn().ValueGeneratedOnAdd();

                tb.Property(col => col.Name).HasMaxLength(60);
            });

            modelBuilder.Entity<Product>().ToTable("Product");
            modelBuilder.Entity<Category>().ToTable("Category");
        }
    }
}
