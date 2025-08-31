<?php


namespace App\Http\Controllers;


use Inertia\Inertia;
use Illuminate\Http\Request;


class HomeController extends Controller
{
public function index()
{
// Data contoh yang bisa dikonsumsi React
$data = [
'pkbm' => [
[
'title' => 'PKBM Insan Mandiri',
'address' => 'Jl. Contoh No.1, Banjarnegara',
],
[
'title' => 'PKBM Armada',
'address' => 'Jl. Contoh No.2, Banjarnegara',
],
[
'title' => 'PKBM Bina Nusantara',
'address' => 'Jl. Contoh No.3, Banjarnegara',
],
],
];


return Inertia::render('Home', $data);
}


public function apiHome()
{
return response()->json(['ok' => true]);
}
}
