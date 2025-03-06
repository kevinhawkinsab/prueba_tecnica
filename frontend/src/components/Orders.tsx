import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, styled, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Swal from 'sweetalert2';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';


interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  imageUrl: string,
  name: string;
  categoryId: number;
  price: number;
  quantity: number;
  description: string;
  inventory: string;
}

interface OrdersProps {
  products: Product[];
  onProductsUpdate: () => void;
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});


export default function Orders({ products, onProductsUpdate }: OrdersProps ) {
  const [categories, setCategories] = useState<Array<Category> | null>(null);
  const [category, setCategory] = useState(1);
  const [selectedProduct, setSelectedProducts] = useState<Product | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  const editProduct = (product: Product) => {
    console.log(product);
    setImagePreview(product.imageUrl);
    setCategory(product.categoryId);
    setSelectedProducts(product);
    setOpenUpdateModal(true);
  }

  const updateProductClose = () => {
    setOpenUpdateModal(false);
  };

  useEffect(() => {
    const cat = localStorage.getItem('categories');
    // console.log(cat)
    if (cat) {
      setCategories(JSON.parse(cat));
    } else {
      setCategories(null);
    }
  }, []);

  const updProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.append('id', selectedProduct?.id + '');

    // console.log(data);
    try {
      const response = await axios.put(`https://localhost:7151/api/Product/Update/`,  data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
      setOpenUpdateModal(false);
      onProductsUpdate();

      Swal.fire({
        title: "Exito!",
        text: "El producto fue actualizado exitosamente.",
        icon: "success"
      });
      
    } catch (err: any) {
      console.error(err);
      setOpenUpdateModal(false);
      const nestedData = err.response.data;
      
      console.log(nestedData)

      const value: any = Object.values(nestedData)[0];

      var message = '';
      if(nestedData.message) {
        message = nestedData.message
      }else {
        message = value[0];
      }

      Swal.fire({
        title: "Error!",
        text: message,
        icon: "error"
      });

      setImagePreview(null);
      setImageName(null);
    }
  };

  const getCategoryName = (cat: number): string | null => {
    const category = categories?.find((element)=> element.id == cat);
    // console.log(category);
    return category ? category.name : null;
  };

  const handleChange = (event: any) => {
    console.log('Cat: ', event.target.value);
    setCategory(event.target.value);
  }

  const imageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const inputNumber = (event: any) => {
    console.log(event.key);
    const pattern = /^[0-9]*$/;

    if (!pattern.test(event.key) && event.key != 'Backspace') {
      event.preventDefault();
    }
  }

  const inputAmount = (event: any) => {
    console.log(event.key);
    const inputValue = event.target.value;
    const pattern = /^[0-9]*\.?[0-9]{0,2}$/;

    if (!pattern.test(event.key) && event.key != 'Backspace') {
      event.preventDefault();
    }

    if (inputValue.includes('.')) {
      const decimalPart = inputValue.split('.');
      console.log(decimalPart[1])
      if (decimalPart[1].length >= 2 && event.key !== 'Backspace') {
        event.preventDefault();
      }
    }
  }

  const deleteProduct = (id: number) => {
    Swal.fire({
      title: "Estás seguro?",
      text: "No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Eliminar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        console.log(id)
        try {
          const response = await axios.delete(`https://localhost:7151/api/Product/Remove/${id}`);
          console.log(response.data);
          Swal.fire({
            title: "Exito!",
            text: "El producto fue eliminado exitosamente!",
            icon: "success"
          });
          onProductsUpdate();
          
        } catch (err: any) {
          console.error(err);
          const nestedData = err.response.data;
          console.log(nestedData)
    
          const value: any = Object.values(nestedData)[0];
          const message = value[0];
    
          Swal.fire({
            title: "Error!",
            text: message,
            icon: "error"
          });
        }
      }
    });
  }


  return (
    <React.Fragment>
      <h3>Lista de Productos</h3>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Imagen</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Inventario</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell><img className='img' src={product.imageUrl} /></TableCell>
              <TableCell className='capitalize'>
                {product.name}
                <p className='upper'>{product.description}</p>
              </TableCell>
              <TableCell>{getCategoryName(product.categoryId)}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>
                {product.inventory === 'En Stock' ? (
                  <p className='stock'><FiberManualRecordIcon /> {product.inventory}</p>
                ) : product.inventory === 'Limitado' ? (
                  <p className='limited'><FiberManualRecordIcon /> {product.inventory}</p>
                ) : (
                  <p className='out-of-stock'><FiberManualRecordIcon /> {product.inventory}</p>
                )}
              </TableCell>
              <TableCell align="right">
                <IconButton aria-label="edit" onClick={() => editProduct(product)}>
                  <EditNoteIcon />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => deleteProduct(product.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={openUpdateModal} onClose={updateProductClose}
        PaperProps={{
          component: 'form',
          onSubmit: updProduct
        }}
      >
        <DialogTitle>Actualizar Produto</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{paddingTop: '10px'}}>
            <Grid sx={{paddingTop: '1rem'}} item xs={12} sm={6}>
              <TextField name="name" required fullWidth id="name" label="Nombre" autoFocus defaultValue={selectedProduct?.name} />
            </Grid>
            <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Categoria</InputLabel>
                <Select labelId="demo-simple-select-label" id="demo-simple-select" name="categoryId"
                  value={category} label="Category" onChange={handleChange}>
                  {categories?.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth >
                <InputLabel htmlFor="outlined-adornment-amount">Precio</InputLabel>
                <OutlinedInput  style={{height: '3.5em'}}
                  id="outlined-adornment-amount"
                  startAdornment={<InputAdornment position="start">$</InputAdornment>}
                  label="Precio" required fullWidth name="price" onKeyDown={inputAmount} defaultValue={selectedProduct?.price}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth  name="quantity" label="Cantidad" id="quantity" onKeyDown={inputNumber} defaultValue={selectedProduct?.quantity} />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField fullWidth multiline rows={4} id="desc" label="Descripción" name="description" defaultValue={selectedProduct?.description} />
            </Grid>
            <Grid sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}} item xs={12}>
              <Button component="label" sx={{mb: 2}} role={undefined} variant="contained" tabIndex={-1} startIcon={<CloudUploadIcon />}>
                Cambiar imagen
                <VisuallyHiddenInput name='image' type="file" onChange={imageChange}/>
              </Button>
              {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />}
              {imageName && <p>{imageName}</p>}
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions sx={{padding: '0 1.5rem'}}>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Guardar
          </Button>
          <Button color='error' onClick={updateProductClose} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}