<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder {
    public function run(): void {
        Category::create(['name' => 'Oli']);
        Category::create(['name' => 'Ban']);
        Category::create(['name' => 'Aki']);
    }
}

