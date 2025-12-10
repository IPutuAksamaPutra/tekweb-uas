<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promotion;
use Illuminate\Support\Facades\Validator;

class PromotionController extends Controller
{
    private $allowedRoles = ['admin','super_admin'];

    // ==============================
    // GET PROMO (SEMUA ORANG BISA)
    // ==============================
    public function index()
    {
        return response()->json([
            'promotions' => Promotion::with('products:id,name,price')->get()
        ]);
    }

    // ==============================
    // GET PROMO UNTUK MARKETPLACE USER
    // ==============================
    public function public()
    {
        $promotions = Promotion::with('products:id,name,price')
            ->where('is_active',1)
            ->where('start_date','<=',now())
            ->where('end_date','>=',now())
            ->get();

        return response()->json([
            'message'=>'Promo aktif berhasil diambil',
            'promotions'=>$promotions
        ]);
    }

    // ==============================
    // CREATE PROMO (HANYA ADMIN)
    // ==============================
    public function store(Request $request)
    {
        if(!in_array($request->user()->role,$this->allowedRoles))
            return response()->json(['message'=>'Forbidden'],403);

        $validator = Validator::make($request->all(),[
            'name'=>'required|unique:promotions',
            'discount_type'=>'required|in:percentage,fixed',
            'discount_value'=>'required|numeric|min:0',
            'start_date'=>'required|date',
            'end_date'=>'required|date|after:start_date',
            'is_active'=>'boolean',
            'product_ids'=>'nullable|array',
            'product_ids.*'=>'exists:products,id',
        ]);

        if($validator->fails()) return response()->json(['errors'=>$validator->errors()],422);

        $promo = Promotion::create($request->except('product_ids'));

        if($request->has('product_ids'))
            $promo->products()->attach($request->product_ids);

        return response()->json(['message'=>'Promo dibuat','promo'=>$promo],201);
    }

    // ==============================
    // SHOW DETAIL PROMO
    // ==============================
    public function show(Promotion $promotion)
    {
        return response()->json([
            'promotion'=>$promotion->load('products:id,name,price')
        ]);
    }

    // ==============================
    // UPDATE PROMO (HANYA ADMIN)
    // ==============================
    public function update(Request $request, Promotion $promotion)
    {
        if(!in_array($request->user()->role,$this->allowedRoles))
            return response()->json(['message'=>'Forbidden'],403);

        $validator = Validator::make($request->all(),[
            'name'=>'required|unique:promotions,name,'.$promotion->id,
            'discount_type'=>'required|in:percentage,fixed',
            'discount_value'=>'required|numeric|min:0',
            'start_date'=>'required|date',
            'end_date'=>'required|date|after:start_date',
            'is_active'=>'boolean',
            'product_ids'=>'nullable|array',
            'product_ids.*'=>'exists:products,id',
        ]);

        if($validator->fails()) return response()->json(['errors'=>$validator->errors()],422);

        $promotion->update($request->except('product_ids'));

        if($request->has('product_ids'))
            $promotion->products()->sync($request->product_ids);

        return response()->json(['message'=>'Promo diupdate']);
    }

    // ==============================
    // DELETE PROMO (HANYA ADMIN)
    // ==============================
    public function destroy(Request $request, Promotion $promotion)
    {
        if(!in_array($request->user()->role,$this->allowedRoles))
            return response()->json(['message'=>'Forbidden'],403);

        $promotion->delete();
        return response()->json(['message'=>'Promo dihapus']);
    }
}
