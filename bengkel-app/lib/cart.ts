export const addToCart = async (product_id:number) => {
  const token = document?.cookie.match(/token=([^;]+)/)?.[1];
  if (!token) return alert("Silahkan login dahulu.");

  const res = await fetch("http://localhost:8000/api/cart", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ product_id, quantity:1 })
  });

  if(res.ok){
    return true;
  }else{
    console.log(await res.json());
    return false;
  }
};
